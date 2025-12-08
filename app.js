const BASE_URL = 'https://acity-digital-library-management-api.onrender.com';

let currentToken = localStorage.getItem('userToken');
let currenUserRole = localStorage.getItem('userRole');

function loadUserstate(){
    currentaToken = localStorage.getItem('userToken');
    currenUserRole = localStorage.getItem('userRole');
}

function displayMessage(constainerId, text, type){
    const el = document.getElementById(constainerId);
    if (!el) return;
    el.textContent = text;
    el.className = `message-visible ${type}`;
}

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

function checkAuthAndRedirect() {
    loadUserState();
    if (!currentToken) {
        window.location.href = 'index.html';
    }

    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        if (currentUserRole === 'admin') {
            adminPanel.style.display = 'block';
        } else {
            adminPanel.style.display = 'none';
        }
    }
}



async function fetchAPI(endpoint, method, data = null) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    
    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: data ? JSON.stringify(data) : null,
    });

    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(result.error || `Request failed with status ${response.status}`);
    }
    return result;
}

// Logic for index.html (Login)
window.handleLogin = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    displayMessage('message-login', 'Logging in...', '');
    
    try {
        const result = await fetchAPI('/auth/login', 'POST', { username, password });
        
        localStorage.setItem('userToken', result.token);
        localStorage.setItem('userRole', result.role);
        
        // Success: Redirect to the catalogue page
        window.location.href = 'catalogue.html'; 
    } catch (error) {
        displayMessage('message-login', `Error: ${error.message}`, 'error');
    }
};

// Logic for register.html (Registration)
window.handleRegister = async (event) => {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    displayMessage('message-register', 'Registering...', '');
    
    try {
        await fetchAPI('/auth/register', 'POST', { username, password, role: 'student' });
        
        displayMessage('message-register', 'Registration successful! Redirecting to login...', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
    } catch (error) {
        displayMessage('message-register', `Error: ${error.message}`, 'error');
    }
};

// Logic for catalogue.html (Book Management & Display)
window.fetchBooks = async () => {
    const listElement = document.getElementById('bookList');
    if (!listElement) return;
    listElement.innerHTML = 'Fetching books from API...';

    try {
        const books = await fetchAPI('/books', 'GET');
        
        if (books.length === 0) {
            listElement.innerHTML = '<p>The catalogue is empty.</p>';
            return;
        }

        listElement.innerHTML = books.map(book => `
            <div style="border: 1px solid #eee; padding: 15px; margin-bottom: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${book.title}</strong> by ${book.author} (ISBN: ${book.isbn})<br>
                    Available: <span style="color: ${book.available_copies > 0 ? 'var(--success-color)' : 'var(--error-color)'};">${book.available_copies} / ${book.total_copies}</span>
                </div>
                <div>
                    ${currentUserRole !== 'admin' && book.available_copies > 0 ? 
                        `<button onclick="window.handleBorrow(${book.book_id})" style="background-color: #007bff; width: auto; padding: 8px 12px; margin-right: 10px;">Borrow</button>` : ''}
                    ${currentUserRole === 'admin' ? 
                        `<button onclick="window.handleDeleteBook(${book.book_id})" style="background-color: var(--error-color); width: auto; padding: 8px 12px;">Delete</button>` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        listElement.innerHTML = `<p style="color: var(--error-color);">Failed to load catalogue. Check server connection: ${error.message}</p>`;
    }
};

window.handleAddBook = async (event) => {
    event.preventDefault();
    const form = event.target;
    const title = form.title.value;
    const author = form.author.value;
    const total_copies = parseInt(form.copies.value);
    const isbn = form.isbn.value;
    
    displayMessage('message-admin', 'Adding book...', '');

    try {
        await fetchAPI('/books', 'POST', { title, author, total_copies, isbn });
        displayMessage('message-admin', `Book added successfully!`, 'success');
        window.fetchBooks(); 
        form.reset();
    } catch (error) {
        displayMessage('message-admin', `Failed to add book: ${error.message}`, 'error');
    }
};

window.handleDeleteBook = async (bookId) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    
    try {
        await fetchAPI(`/books/${bookId}`, 'DELETE');
        displayMessage('message-catalogue', `Book ID ${bookId} deleted successfully.`, 'success');
        window.fetchBooks(); 
    } catch (error) {
        displayMessage('message-catalogue', `Failed to delete book: ${error.message}`, 'error');
    }
};

window.handleBorrow = async (bookId) => {
    try {
        await fetchAPI('/transactions/borrow', 'POST', { bookId });
        displayMessage('message-catalogue', `Book borrowed successfully!`, 'success');
        window.fetchBooks(); 
    } catch (error) {
        displayMessage('message-catalogue', `Borrow failed: ${error.message}`, 'error');
    }
};

// Logic for password.html (Changin Password)
window.handleChangePassword = async (event) => {
    event.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    displayMessage('message-password', 'Updating password...', '');
    
    // Placeholder logic for backend route
    if (newPassword.length < 6) {
        return displayMessage('message-password', 'Password must be at least 6 characters.', 'error');
    }

    try {
        const result = await fetchAPI('/auth/password', 'PUT', { newPassword });
        
        displayMessage('message-password', 'Password change simulation successful! Please log in again.', 'success');
        setTimeout(window.logout, 2000); 
    } catch (error) {
        displayMessage('message-password', `Update failed: ${error.message}`, 'error');
    }
};


document.addEventListener('DOMContentLoaded', loadUserState);
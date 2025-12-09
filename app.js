const BASE_URL = 'https://acity-digital-library-management-api.onrender.com';

let currentToken = localStorage.getItem('userToken');
let currentUserRole = localStorage.getItem('userRole');
let dueTimerInterval; 

function loadUserState(){
    currentToken = localStorage.getItem('userToken');
    currentUserRole = localStorage.getItem('userRole');
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

// TIMER LOGIC 

function formatTimeRemaining(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
    if (seconds > 0 && days === 0 && hours === 0 && minutes === 0) parts.push(`${seconds}s`);

    if (parts.length === 0) {
        return totalSeconds >= 0 ? 'Less than 1s' : 'Due Date Passed'; 
    }
    return parts.join(' ');
}

function updateDueTimers() {
    const timers = document.querySelectorAll('[data-due-date]');
    const now = Date.now();
    let timersFound = false;

    timers.forEach(timerEl => {
        timersFound = true;
        const dueDate = new Date(timerEl.dataset.dueDate).getTime();
        const timeRemaining = dueDate - now;

        if (timeRemaining > 0) {
            timerEl.textContent = formatTimeRemaining(timeRemaining) + ' remaining';
            timerEl.style.color = 'var(--success-color)';
        } else {
            timerEl.textContent = 'Due Date Passed!';
            timerEl.style.color = 'var(--error-color)';
            timerEl.style.fontWeight = 'bold';
        }
    });

    if (!timersFound && dueTimerInterval) {
        clearInterval(dueTimerInterval);
        dueTimerInterval = null;
    }
}


// Logic for index.html (Login)
window.handleLogin = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    displayMessage('message-login', 'Logging in...', '');
    
    try {
        const result = await fetchAPI('/api/auth/login', 'POST', { username, password });
        
        localStorage.setItem('userToken', result.token);
        localStorage.setItem('userRole', result.role);
        
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
        await fetchAPI('/api/auth/register', 'POST', { username, password, role: 'student' });
        
        displayMessage('message-register', 'Registration successful! Redirecting to login...', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
    } catch (error) {
        displayMessage('message-register', `Error: ${error.message}`, 'error');
    }
};

// Logic for catalogue.html 
window.fetchBooks = async () => {
    const selectedCategory = document.getElementById('filter-category')?.value || '';
    const searchInput = document.getElementById('search-input')?.value || '';
    
    let queryParams = '';
    if (selectedCategory) {
        queryParams += `category=${encodeURIComponent(selectedCategory)}&`;
    }
    if (searchInput) {
        queryParams += `search=${encodeURIComponent(searchInput)}&`;
    }
    
    if (queryParams) {
        queryParams = `?${queryParams.slice(0, -1)}`; 
    }

    try {
        const books = await fetchAPI(`/api/books${queryParams}`, 'GET');
        const bookList = document.getElementById('bookList');
        if (!bookList) return;

        bookList.innerHTML = books.map(book => {
            const isAvailable = book.available_copies > 0;
            const cardClass = isAvailable ? 'book-card available' : 'book-card not-available';
            const buttonText = isAvailable ? 'Borrow' : 'No Copies';
            const buttonDisabled = !isAvailable ? 'disabled' : '';
            const adminControls = (currentUserRole === 'admin') ? 
                `<button onclick="window.handleDeleteBook(${book.book_id})" class="btn-danger btn-small">Delete</button>` : '';

            return `
                <div class="${cardClass}" id="book-${book.book_id}">
                    <h4 class="book-title">${book.title}</h4>
                    <p class="book-author">by ${book.author}</p>
                    <p class="book-category-tag">Category: ${book.category || 'N/A'}</p>
                    <p class="book-meta">ISBN: ${book.isbn}</p>
                    <p class="book-copies">Available: ${book.available_copies} / ${book.total_copies}</p>
                    <div class="book-actions">
                        ${adminControls}
                        <button onclick="window.handleBorrow(${book.book_id})" 
                                class="btn-primary" ${buttonDisabled}>
                            ${buttonText}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (books.length === 0) {
            bookList.innerHTML = '<p style="text-align:center; color:#666;">No books found matching your criteria.</p>';
        }

    } catch (error) {
        displayMessage('message-catalogue', `Error loading catalogue: ${error.message}`, 'error');
    }
};

window.handleAddBook = async (event) => {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const isbn = document.getElementById('isbn').value;
    const total_copies = parseInt(document.getElementById('copies').value);
    const category = document.getElementById('category').value; 
    
    if (!category) {
        return displayMessage('message-admin', 'Error: Please select a category.', 'error');
    }
    
    if (total_copies < 1) {
        return displayMessage('message-admin', 'Error: Total Copies must be at least 1.', 'error');
    }

    displayMessage('message-admin', 'Adding book...', '');
    try {
       const newBook = await fetchAPI('/api/books', 'POST', { title, author, isbn, category, total_copies });
       displayMessage('message-admin', `Book "${newBook.title}" added successfully!`, 'success');
       document.getElementById('addBookForm').reset();
       window.fetchBooks();
    } catch (error) {
        displayMessage('message-admin', `Failed to add book: ${error.message}`, 'error');
    }
};

window.handleDeleteBook = async (bookId) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    
    try {
        await fetchAPI(`/api/books/${bookId}`, 'DELETE');
        displayMessage('message-catalogue', `Book ID ${bookId} deleted successfully.`, 'success');
        window.fetchBooks(); 
    } catch (error) {
        displayMessage('message-catalogue', `Failed to delete book: ${error.message}`, 'error');
    }
};

// Logic for borrowing a book (updated message)
window.handleBorrow = async (bookId) => {
    try {
        await fetchAPI('/api/transactions/borrow', 'POST', { bookId });
        displayMessage('message-catalogue', `Book borrowed successfully! It is due in 15 days.`, 'success');
        window.fetchBooks(); 
    } catch (error) {
        displayMessage('message-catalogue', `Borrow failed: ${error.message}`, 'error');
    }
};

// TRANSACTIONS LOGIC

// Logic for returning a book
window.handleReturn = async (transactionId) => {
    if (!confirm("Are you sure you want to return this book?")) return;
    
    displayMessage('message-borrowed', 'Processing return...', '');

    try {
        await fetchAPI(`/api/transactions/return/${transactionId}`, 'PUT');
        
        displayMessage('message-borrowed', `Book successfully returned!`, 'success');
        
        if (document.getElementById('borrowedList')) {
            window.fetchBorrowedBooks(); 
        } 
    } catch (error) {
        displayMessage('message-borrowed', `Return failed: ${error.message}`, 'error');
    }
};

// Logic for fetching user's borrowed books with timer integration
window.fetchBorrowedBooks = async () => {
    loadUserState();
    const listElement = document.getElementById('borrowedList');
    if (!listElement) return;
    listElement.innerHTML = 'Fetching your borrowed books...';

    if (dueTimerInterval) {
        clearInterval(dueTimerInterval);
    }

    try {
        const transactions = await fetchAPI('/api/transactions/my-books', 'GET');
        
        if (transactions.length === 0) {
            listElement.innerHTML = '<p>You currently have no borrowed books.</p>';
            return;
        }

        listElement.innerHTML = transactions.map(transaction => {
            const dueDate = new Date(transaction.due_date);
            
            return `
                <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${transaction.book_title}</strong> by ${transaction.book_author || 'Unknown Author'}<br>
                        Borrowed: ${new Date(transaction.borrow_date).toLocaleDateString()}
                    </div>
                    <div style="text-align: right;">
                        Due in:<br>
                        <span id="timer-${transaction.borrow_id}" data-due-date="${dueDate.toISOString()}">Loading timer...</span>
                    </div>
                    <div>
                        <button onclick="window.handleReturn(${transaction.borrow_id})" style="background-color: var(--warning-color); width: auto; padding: 8px 12px;">Return Book</button>
                    </div>
                </div>
            `;
        }).join('');
        
        updateDueTimers();
        dueTimerInterval = setInterval(updateDueTimers, 1000); 
        
    } catch (error) {
        listElement.innerHTML = `<p style="color: var(--error-color);">Failed to load borrowed books: ${error.message}</p>`;
    }
};

// logic for Fetching and Rendering Borrowed Books
window.fetchMyBooks = async () => {
    try {
        const transactions = await window.fetchAPI('/api/transactions/my-books', 'GET');
        const listEl = document.getElementById('myBookList');
        if (!listEl) return;
        
        listEl.innerHTML = '';
        window.displayMessage('message-mybooks', '', '');

        if (transactions.length === 0) {
            listEl.innerHTML = '<p style="text-align:center; color:#666; padding: 20px;">You have no borrowed or returned books in your history.</p>';
            return;
        }

        listEl.innerHTML = transactions.map(t => {
            const status = window.getReturnStatus(t.due_date, t.return_date);
            const isReturned = status !== 'Currently Borrowed';
            
            const button = isReturned 
                ? `<button disabled class="btn-secondary btn-small">Returned</button>` 
                : `<button onclick="window.handleReturn(${t.borrow_id})" class="btn-success btn-small">Return Now</button>`;
            
            let statusClass = 'status-borrowed'; 
            if (status === 'Returned On Time/Early') statusClass = 'status-early';
            if (status === 'Returned Late') statusClass = 'status-late';

            const borrowDate = new Date(t.borrow_date).toLocaleDateString();
            const dueDate = new Date(t.due_date).toLocaleDateString();
            const returnDateDisplay = t.return_date ? new Date(t.return_date).toLocaleDateString() : '—';
            
            return `
                <div class="transaction-card ${statusClass}">
                    <h5>${t.book_title}</h5>
                    <p class="book-author">by ${t.book_author}</p>
                    <p>Borrowed: ${borrowDate}</p>
                    <p>Due: ${dueDate}</p>
                    <p>Returned: ${returnDateDisplay}</p>
                    <p class="status-indicator">Status: <strong class="${statusClass}">${status}</strong></p>
                    <div class="actions">${button}</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        window.displayMessage('message-mybooks', `Error loading borrowed books: ${error.message}`, 'error');
    }
};

function getReturnStatus(dueDate, returnDate) {
    if (!returnDate) return 'Currently Borrowed';

    const due = new Date(dueDate);
    const returned = new Date(returnDate);

    due.setHours(0, 0, 0, 0);
    returned.setHours(0, 0, 0, 0);

    if (returned <= due) {
        return 'Returned On Time/Early';
    } else {
        return 'Returned Late';
    }
};

// Logic for password.html (Changin Password)
window.handleChangePassword = async (event) => {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password')?.value || ''; 
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    displayMessage('message-password', 'Updating password...', '');
    
    if (newPassword !== confirmPassword) {
        return displayMessage('message-password', 'Error: New passwords do not match.', 'error');
    }

    if (newPassword.length < 6) {
        return displayMessage('message-password', 'Error: Password must be at least 6 characters.', 'error');
    }
    
    if (!currentPassword && document.getElementById('current-password')) {
        return displayMessage('message-password', 'Error: Please enter your current password.', 'error');
    }

    try {
        await fetchAPI('/api/auth/password', 'PUT', { 
            currentPassword: currentPassword,
            newPassword: newPassword 
        });
        
        displayMessage('message-password', 'Password change successful! Please log in again.', 'success');
        setTimeout(window.logout, 2000); 
    } catch (error) {
        displayMessage('message-password', `Update failed: ${error.message}`, 'error');
    }
};

document.addEventListener('DOMContentLoaded', loadUserState);

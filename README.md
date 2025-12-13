## 💻 Digital Library Frontend

This project is a clean, responsive web interface for interacting with the **Digital Library API**.  
It is built using **native HTML, CSS, and vanilla JavaScript** to ensure maximum performance, simplicity, and accessibility.

---

## 🎨 Design and Structure

| File Name | Description | Key Components |
|---------|------------|----------------|
| `index.html` | Login Page | User login form |
| `register.html` | Registration Page | New student/admin registration form |
| `catalogue.html` | Main Catalogue | Displays available books, search/filter controls, and the Admin Panel for book management |
| `userBooks.html` | My Borrowed Books | Shows the user’s borrowing history, due dates, and return actions |
| `password.html` | Change Password | Form for authenticated users to update their password |
| `styles.css` | Styling | Responsive, modern card-based layout |
| `app.js` | Core Logic | Handles API communication, DOM manipulation, authentication state, and UI logic |

---

## 💡 Core Frontend Functionality (`app.js`)

The `app.js` file manages the entire client-side logic and communicates with the backend API.

---

### 1️⃣ Authentication & State Management

- **State Loading**
  - Loads `userToken`, `userRole`, and `username` from `localStorage` on initialization.
- **Token Management**
  - All authenticated requests use the `fetchAPI` helper, which automatically attaches:
    ```
    Authorization: Bearer <token>
    ```
- **Route Protection**
  - `checkAuthAndRedirect()` ensures users are on the correct page:
    - Redirects authenticated users away from `index.html`
    - Redirects unauthenticated users away from protected pages like `catalogue.html`
- **Logout**
  - `logout()` clears `localStorage` and redirects the user to the login page.

---

### 2️⃣ Catalogue & Book Display

- **fetchBooks()**
  - Retrieves books from `/api/books`
  - Applies:
    - Search terms (`search-input`)
    - Category filters (`filter-category`)
- **renderBooks()**
  - Dynamically generates book cards (`book-card`) in `catalogue.html`
  - Shows or hides the **Admin Panel** based on `currentUserRole`
- **User Actions**
  - `handleBorrow` → `POST /api/transactions/borrow`
  - `handleDeleteBook` → `DELETE /api/books/:bookId`

---

### 3️⃣ Transaction History

- **fetchBorrowedBooks()**
  - Fetches the user’s borrowing history from `/api/transactions/my-books`
- **renderBorrowedBooks()**
  - Displays borrowed books on `userBooks.html`
- **Overdue Status**
  - Renders due dates
  - Highlights overdue books for immediate visual feedback
- **Return Action**
  - `handleReturn` → `PUT /api/transactions/return/:borrowId`

---

### 4️⃣ UI / UX Features

- **CORS Configuration**
  - `BASE_URL` is set to the deployed backend URL to support cross-origin requests.
- **User Feedback**
  - `displayMessage()` provides clear, color-coded success and error messages.
- **Role-Based UI**
  - The **Admin Panel** in `catalogue.html` is conditionally rendered based on `currentUserRole`, ensuring admin-only features are not visible to regular users.

---

## ✅ Technology Stack

- **HTML5**
- **CSS3**
- **Vanilla JavaScript (ES6+)**
- **RESTful API Integration**

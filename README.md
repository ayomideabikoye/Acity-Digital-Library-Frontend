# 📚 ACity Digital Library API

A robust RESTful API built with **Node.js**, **Express**, and **PostgreSQL** to manage the backend operations of a digital library system. This project was developed as part of a coursework assignment to demonstrate secure authentication, database management, and transactional logic.

## 🚀 Features

* **User Authentication**: Secure registration and login using `bcrypt` for password hashing and `JWT` (JSON Web Tokens) for session management.
* **Role-Based Access Control (RBAC)**: Distinct permissions for **Admin** (inventory management) and **Users** (borrowing).
* **Inventory Management**: Admins can add, update, and delete books.
* **Transactional Borrowing**: Handles borrowing and returning logic using SQL transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) to ensure data integrity.
* **Search & Filter**: Dynamic querying allows searching by title, author, or category.
* **Security**: Implements CORS allow-listing and password encryption.

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: PostgreSQL (hosted on Render)
* **Authentication**: JWT & Bcrypt
* **Deployment**: Compatible with Render/Heroku

## 📂 Database Schema

The system relies on three relational tables. You can use the following SQL to set up the database locally:

```sql
-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' -- 'admin' or 'user'
);

-- Books Table
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(50),
    category VARCHAR(100),
    total_copies INT NOT NULL,
    available_copies INT NOT NULL
);

-- Borrows (Transactions) Table
CREATE TABLE borrows (
    borrow_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    book_id INT REFERENCES books(book_id),
    borrow_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    return_date DATE
);
```
## API Routes & Endpoints

### Authentication & User Management (`/api/auth`)

| Method | Endpoint | Description | Access | Request Body / Query Params |
|------|---------|-------------|--------|-----------------------------|
| POST | `/auth/register` | Creates a new user account with a specified role (`user` or `admin`). | Public | `username`, `password`, `role` |
| POST | `/auth/login` | Authenticates a user and returns a JWT for subsequent requests. | Public | `username`, `password` |
| PUT  | `/auth/password` | Updates the authenticated user's password after verifying the current one. | Authenticated | `currentPassword`, `newPassword` |

---

### Book Catalog (`/api/books`)

| Method | Endpoint | Description | Access | Request Body / Query Params |
|------|---------|-------------|--------|-----------------------------|
| GET | `/books` | Retrieves a list of all books. | Public | Query Params: `search` (title/author), `category` |
| POST | `/books` | Adds a new book to the library catalog. Sets `available_copies = total_copies`. | Admin Only | `title`, `author`, `isbn`, `category`, `total_copies` |
| DELETE | `/books/:bookId` | Deletes a book by its ID. Fails if there are active unreturned borrows. | Admin Only | None |

---

### Borrowing & Transactions (`/api/transactions`)

| Method | Endpoint | Description | Access | Request Body / Query Params |
|------|---------|-------------|--------|-----------------------------|
| POST | `/transactions/borrow` | Borrows a book. Checks availability and prevents duplicate borrows by the same user. Uses a DB transaction. | Authenticated | `book_id` |
| PUT | `/transactions/return/:borrowId` | Returns a book. Updates `return_date` and increments `available_copies`. Uses a DB transaction. | Authenticated | Path Param: `borrowId` |
| GET | `/transactions/my-books` | Retrieves the borrowing history of the authenticated user. | Authenticated | None |

## 🔒 Middleware & Security

### `authenticateToken` (middleware.js)
- Verifies the JWT from the `Authorization` header.
- Attaches the decoded user payload (`user_id`, `role`) to `req.user`.
- Returns:
  - **401 Unauthorized** if no token is provided
  - **403 Forbidden** if the token is invalid or expired

### `requireAdmin` (middleware.js)
- Checks whether `req.user.role` is equal to `'admin'`.
- Returns:
  - **403 Forbidden** if the authenticated user is not an admin

---

## 🔁 Database Transactions (`transactions.js`)

- The **`/borrow`** and **`/return`** routes use explicit PostgreSQL transactions:
  - `BEGIN`
  - `COMMIT`
  - `ROLLBACK`
- This ensures **atomic multi-step operations**, such as:
  - Updating the `borrows` table
  - Updating the `books.available_copies` count
- If any step fails, all changes are rolled back, maintaining **data integrity**.
- Prevents issues such as:
  - Incorrect book availability counts
  - Successful borrows without corresponding transaction records

---

## 🎯 Assignment Submission Notes

This project demonstrates proficiency in the following areas:

### ✅ Modular Express Design
- Routes are separated into dedicated files:
  - `auth.js`
  - `books.js`
  - `transactions.js`
- Middleware logic is isolated in `middleware.js`.

### ✅ Data Integrity
- Explicit PostgreSQL transactions (`BEGIN / COMMIT / ROLLBACK`) are implemented in the `/borrow` and `/return` routes to ensure atomic operations.

### ✅ Security
- JSON Web Tokens (JWT) are used for secure session management.
- Passwords are securely stored using **bcrypt hashing**.

### ✅ Input & Business Logic Validation
- Validation checks include:
  - Book availability before borrowing
  - Prevention of duplicate borrows by the same user
  - Admin-only access enforcement
  - Credential and input validation before database operations

### ✅ Error Handling
- Robust error handling across all routes, including:
  - Database constraint violations:
    - **23505** (unique constraint)
    - **23503** (foreign key constraint)
  - General server and unexpected errors


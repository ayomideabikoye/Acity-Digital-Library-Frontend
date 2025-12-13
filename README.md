
---

# 🎨 FRONTEND README.md (COPY EVERYTHING BELOW)


# 💻 Digital Library Catalogue System – Frontend

![HTML](https://img.shields.io/badge/HTML-Frontend-orange)
![CSS](https://img.shields.io/badge/CSS-Styling-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![Deployment](https://img.shields.io/badge/Hosted_on-GitHub_Pages-success)
![Course](https://img.shields.io/badge/Course-CS3139_Web_Technologies-purple)

This repository contains the frontend interface for the Digital Library Catalogue System.  
It allows students and administrators to interact with the backend API through a clean and responsive user interface.

---

## 🧾 Project Overview

The frontend is built using **HTML, CSS, and Vanilla JavaScript** and communicates with the backend using the Fetch API.

### Core Capabilities
- User login and registration
- Book catalogue browsing
- Search and filter functionality
- Borrow and return management
- Role-based UI rendering

---

## 🌐 Deployment Link

- **Frontend (GitHub Pages):**  
  👉 `https://ayomideabikoye.github.io/Acity-Digital-Library-Frontend/`

---

## 🔐 Login Details (For Grading)

### Admin Account
Name: Ayomide Abikoye
Password: a123456$#


### Student Account
- Students can register using the registration page.

---

## ✅ Feature Checklist (Frontend)

### 🔑 Authentication
- ✅ Login and registration forms
- ✅ JWT stored in localStorage
- ✅ Protected page redirection

### 📖 Book Catalogue
- ✅ Display all books
- ✅ Search by title or author
- ✅ Filter by category
- ✅ Availability status display

### 🔄 Borrow & Return
- ✅ Borrow available books
- ✅ View borrowing history
- ✅ Due date tracking
- ✅ Overdue book highlighting
- ✅ Return borrowed books

### 🎨 UI / UX
- ✅ Responsive layout
- ✅ Role-based admin panel
- ✅ Clear success and error messages

---

## 🧩 Frontend Structure

| File | Purpose |
|----|--------|
| `index.html` | Login page |
| `register.html` | Registration page |
| `catalogue.html` | Book catalogue & admin panel |
| `userBooks.html` | Borrowed books |
| `password.html` | Change password |
| `styles.css` | Styling |
| `app.js` | API logic and UI control |

---

## ⚙️ Frontend Logic (`app.js`)

- Manages authentication state using localStorage
- Attaches JWT to API requests
- Fetches and renders books dynamically
- Controls admin-only UI elements
- Handles borrowing and returning of books

---


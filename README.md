# 💰 FinTrack – Personal Expense Tracker

A full-stack personal finance tracker built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). FinTrack lets you log expenses, set monthly budgets, and visualize your spending with interactive charts — all behind secure JWT authentication.

---

## 🚀 Live Features

- 🔐 **User Authentication** — Signup & Login with JWT (passwords hashed with bcrypt)
- 💸 **Expense Management** — Add, edit, delete expenses with category, date & description
- 🗂️ **Category Filtering** — Filter expenses by Food, Transport, Entertainment, Health, Shopping, Bills, Other
- 💰 **Budget Manager** — Set monthly budgets per category with live progress bars & alerts
- 📊 **Dashboard & Charts** — Pie chart, bar charts, area chart powered by Recharts
- 🗄️ **MongoDB Atlas** — All data persisted in cloud database
- 📱 **Responsive UI** — Works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js, Recharts, CSS3            |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas (Mongoose ODM)        |
| Auth       | JWT (jsonwebtoken) + bcryptjs       |
| Tools      | Git, GitHub, VS Code                |

---

## 📁 Project Structure

```
fintrack/
│
├── backend/                        # Node.js + Express API
│   ├── middleware/
│   │   └── auth.js                 # JWT token verification middleware
│   ├── models/
│   │   ├── User.js                 # User schema (bcrypt password hashing)
│   │   ├── Expense.js              # Expense schema (linked to user)
│   │   └── Budget.js               # Budget schema (per user/category/month)
│   ├── routes/
│   │   ├── auth.js                 # POST /signup, POST /login, GET /me
│   │   ├── expenses.js             # Full CRUD for expenses (protected)
│   │   └── budgets.js              # Get, set, delete budgets (protected)
│   ├── .env                        # Environment variables (never commit!)
│   ├── .gitignore                  # Ignores node_modules & .env
│   ├── package.json
│   └── server.js                   # App entry point, MongoDB connection
│
└── frontend/                       # React.js App
    ├── public/
    │   └── index.html
    └── src/
        ├── pages/
        │   ├── Login.js            # Login page
        │   └── Signup.js           # Signup page
        ├── components/
        │   ├── ExpenseForm.js      # Add/Edit expense modal form
        │   ├── ExpenseList.js      # Expense cards with edit/delete
        │   ├── SummaryBar.js       # Total spent + top categories
        │   ├── BudgetManager.js    # Budget setting & progress bars
        │   └── Dashboard.js        # Charts & analytics
        ├── App.js                  # Main app with routing & auth state
        ├── App.css                 # All styles
        └── index.js                # React entry point
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm
- MongoDB Atlas account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/karanmaurya-git/fintrack.git
cd fintrack
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
MONGO_URI=your_mongodb_connection_string_here
PORT=Your_Port_number_here
JWT_SECRET=your_secret_key_here
```

Start the backend:

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB Atlas
🚀 Server running on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

App opens at **http://localhost:3000**

> The frontend proxies API calls to `localhost:5000` automatically via the `"proxy"` field in `package.json`.

---

## 🔌 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint         | Description              | Auth Required |
|--------|-----------------|--------------------------|---------------|
| POST   | `/signup`        | Register a new user      | ❌            |
| POST   | `/login`         | Login & get JWT token    | ❌            |
| GET    | `/me`            | Get current user info    | ✅            |

### Expense Routes — `/api/expenses`

| Method | Endpoint         | Description              | Auth Required |
|--------|-----------------|--------------------------|---------------|
| GET    | `/`              | Get all user expenses    | ✅            |
| GET    | `/?category=Food`| Filter by category       | ✅            |
| POST   | `/`              | Create new expense       | ✅            |
| PUT    | `/:id`           | Update an expense        | ✅            |
| DELETE | `/:id`           | Delete an expense        | ✅            |

### Budget Routes — `/api/budgets`

| Method | Endpoint         | Description                      | Auth Required |
|--------|-----------------|----------------------------------|---------------|
| GET    | `/?month=2026-06`| Get budgets with spending data   | ✅            |
| POST   | `/`              | Set or update a budget           | ✅            |
| DELETE | `/:id`           | Delete a budget                  | ✅            |

---

## 📊 Dashboard Charts

| Chart | Description |
|-------|-------------|
| 🥧 Pie Chart | Spending breakdown by category for the year |
| 📊 Horizontal Bar | This month's top spending categories |
| 📈 Monthly Bar | Month-by-month spending for the selected year |
| 📉 Area Chart | Cumulative spending trend across the year |

---

## 🔒 Security

- Passwords are **hashed with bcrypt** before storing in DB
- JWT tokens expire after **7 days**
- All expense & budget routes are **protected** — users can only access their own data
- `.env` file is in `.gitignore` — secrets are never committed to GitHub

---

## 🧱 Database Models

### User
```
name, email, password (hashed), createdAt, updatedAt
```

### Expense
```
user (ref), title, amount, category, date, description, createdAt, updatedAt
```

### Budget
```
user (ref), category, limit, month (YYYY-MM), createdAt, updatedAt
Unique index: user + category + month
```

---

## 🌱 Future Improvements

- [ ] Export expenses to CSV
- [ ] Email notifications for budget alerts
- [ ] Dark mode
- [ ] Recurring expenses
- [ ] Deploy to Vercel (frontend) + Render (backend)

---

## 👨‍💻 Author

**Karan Maurya**  
📧 karanmaurya8998@gmail.com  
🔗 [GitHub](https://github.com/karanmaurya-git) · [LinkedIn](https://linkedin.com/in/karan-maurya-4260b6293)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

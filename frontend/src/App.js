import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import SummaryBar from './components/SummaryBar';
import BudgetManager from './components/BudgetManager';
import Dashboard from './components/Dashboard';
import './App.css';

const API = 'https://fintrack-backend-3een.onrender.com/api/expenses';

function App() {
  const [token, setToken] = useState(localStorage.getItem('fintrack_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('fintrack_user') || 'null'));
  const [authPage, setAuthPage] = useState('login');
  const [activeTab, setActiveTab] = useState('expenses');

  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem('fintrack_token', newToken);
    localStorage.setItem('fintrack_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
    setToken(null);
    setUser(null);
    setExpenses([]);
  };

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const fetchExpenses = async (category = filterCategory) => {
    setLoading(true);
    try {
      const params = category !== 'All' ? `?category=${category}` : '';
      const res = await fetch(`${API}${params}`, { headers: authHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchExpenses();
  }, [filterCategory, token]);

  const handleSave = async (formData) => {
    try {
      const method = editingExpense ? 'PUT' : 'POST';
      const url = editingExpense ? `${API}/${editingExpense._id}` : API;
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to save');
      setEditingExpense(null);
      setShowForm(false);
      fetchExpenses();
    } catch (err) {
      setError('Failed to save expense.');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`${API}/${deleteConfirm}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) {
        const data = await res.json();
        setError(`Delete failed: ${data.message}`);
        return;
      }
      setDeleteConfirm(null);
      fetchExpenses();
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  if (!token) {
    return authPage === 'login'
      ? <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />
      : <Signup onLogin={handleLogin} onSwitchToLogin={() => setAuthPage('login')} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">₹</span>
            <span className="logo-text">FinTrack</span>
          </div>
          <div className="header-right">
            <span className="user-greeting">Hi, {user?.name?.split(' ')[0]} 👋</span>
            {activeTab === 'expenses' && (
              <button className="btn-add" onClick={() => { setEditingExpense(null); setShowForm(true); }}>
                + Add Expense
              </button>
            )}
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="tab-bar">
        <div className="tab-bar-inner">
          <button className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>💸 Expenses</button>
          <button className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => setActiveTab('budgets')}>💰 Budgets</button>
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        </div>
      </div>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="modal-overlay">
            <div className="modal" style={{padding: '28px', maxWidth: '360px', textAlign: 'center'}}>
              <div style={{fontSize: '36px', marginBottom: '12px'}}>🗑️</div>
              <h3 style={{marginBottom: '8px', color: '#0f172a'}}>Delete Expense?</h3>
              <p style={{color: '#64748b', fontSize: '14px', marginBottom: '24px'}}>
                This action cannot be undone.
              </p>
              <div style={{display: 'flex', gap: '12px'}}>
                <button
                  className="btn-cancel"
                  style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: '600'}}
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '600'}}
                  onClick={handleDeleteConfirm}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <>
            <SummaryBar expenses={expenses} total={total} />
            {showForm && (
              <div className="modal-overlay">
                <div className="modal">
                  <ExpenseForm
                    initialData={editingExpense}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setEditingExpense(null); }}
                  />
                </div>
              </div>
            )}
            <div className="filter-bar">
              <span className="filter-label">Filter:</span>
              {['All', 'Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills', 'Other'].map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >{cat}</button>
              ))}
            </div>
            {loading ? <div className="loading">Loading expenses...</div> : (
              <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={handleDeleteClick} />
            )}
          </>
        )}

        {activeTab === 'budgets' && <BudgetManager token={token} />}
        {activeTab === 'dashboard' && <Dashboard token={token} />}
      </main>
    </div>
  );
}

export default App;
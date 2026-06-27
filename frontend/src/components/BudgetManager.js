import React, { useState, useEffect } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills', 'Other'];
const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚌', Entertainment: '🎬',
  Health: '💊', Shopping: '🛍️', Bills: '📄', Other: '📦'
};

function BudgetManager({ token }) {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: 'Food', limit: '' });
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets?month=${month}`, { headers: authHeaders() });
      const data = await res.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, [month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.limit || parseFloat(form.limit) <= 0) {
      setError('Enter a valid budget amount');
      return;
    }
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...form, month })
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccess(`Budget set for ${form.category}!`);
      setForm({ category: 'Food', limit: '' });
      setTimeout(() => setSuccess(''), 3000);
      fetchBudgets();
    } catch (err) {
      setError('Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/budgets/${id}`, { method: 'DELETE', headers: authHeaders() });
      fetchBudgets();
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const getBarColor = (pct) => {
    if (pct >= 100) return '#ef4444';
    if (pct >= 80) return '#f97316';
    return '#10b981';
  };

  const getStatus = (pct) => {
    if (pct >= 100) return { label: 'Over budget!', class: 'status-over' };
    if (pct >= 80) return { label: 'Almost at limit', class: 'status-warn' };
    return { label: 'On track', class: 'status-ok' };
  };

  return (
    <div className="budget-manager">
      <div className="budget-header">
        <h2>💰 Budget Manager</h2>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="month-picker"
        />
      </div>

      {error && <div className="auth-error" style={{marginBottom:12}}>{error}<button onClick={() => setError('')} style={{marginLeft:8,background:'none',border:'none',cursor:'pointer'}}>✕</button></div>}
      {success && <div className="success-banner">{success}</div>}

      {/* Set Budget Form */}
      <div className="budget-form-card">
        <h3>Set a Budget</h3>
        <form onSubmit={handleSubmit} className="budget-form">
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
          </select>
          <input
            type="number"
            placeholder="Budget limit (₹)"
            value={form.limit}
            onChange={e => setForm({ ...form, limit: e.target.value })}
            min="1"
          />
          <button type="submit" className="btn-save">Set Budget</button>
        </form>
      </div>

      {/* Budget Progress Cards */}
      {loading ? (
        <div className="loading">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No budgets set</h3>
          <p>Set a budget above to start tracking your spending limits.</p>
        </div>
      ) : (
        <div className="budget-list">
          {budgets.map(b => {
            const pct = Math.min(b.percentage, 100);
            const status = getStatus(b.percentage);
            return (
              <div key={b._id} className={`budget-card ${b.percentage >= 100 ? 'budget-exceeded' : b.percentage >= 80 ? 'budget-warning' : ''}`}>
                <div className="budget-card-top">
                  <div className="budget-cat">
                    <span className="budget-icon">{CATEGORY_ICONS[b.category]}</span>
                    <span className="budget-cat-name">{b.category}</span>
                  </div>
                  <div className="budget-right">
                    <span className={`budget-status ${status.class}`}>{status.label}</span>
                    <button className="btn-delete" onClick={() => handleDelete(b._id)} title="Remove budget">🗑️</button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <span className="budget-spent">{formatAmount(b.spent)} spent</span>
                  <span className="budget-limit">of {formatAmount(b.limit)}</span>
                </div>

                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${pct}%`, backgroundColor: getBarColor(b.percentage) }}
                  />
                </div>

                <div className="budget-pct">{b.percentage}% used</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BudgetManager;

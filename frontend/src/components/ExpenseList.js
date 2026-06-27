import React from 'react';

const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚌',
  Entertainment: '🎬',
  Health: '💊',
  Shopping: '🛍️',
  Bills: '📄',
  Other: '📦'
};

const CATEGORY_COLORS = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Entertainment: '#a855f7',
  Health: '#ef4444',
  Shopping: '#ec4899',
  Bills: '#64748b',
  Other: '#6b7280'
};

function ExpenseList({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💸</div>
        <h3>No expenses yet</h3>
        <p>Click "Add Expense" to record your first transaction.</p>
      </div>
    );
  }

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  return (
    <div className="expense-list">
      <div className="list-header">
        <span>{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</span>
      </div>
      {expenses.map(expense => (
        <div key={expense._id} className="expense-card">
          <div
            className="category-badge"
            style={{
              backgroundColor: CATEGORY_COLORS[expense.category] + '20',
              color: CATEGORY_COLORS[expense.category]
            }}
          >
            <span>{CATEGORY_ICONS[expense.category] || '📦'}</span>
          </div>

          <div className="expense-info">
            <div className="expense-title">{expense.title}</div>
            <div className="expense-meta">
              <span className="expense-category">{expense.category}</span>
              <span className="meta-dot">·</span>
              <span className="expense-date">{formatDate(expense.date)}</span>
            </div>
            {expense.description && (
              <div className="expense-description">{expense.description}</div>
            )}
          </div>

          <div className="expense-right">
            <div className="expense-amount">{formatAmount(expense.amount)}</div>
            <div className="expense-actions">
              <button
                className="btn-edit"
                onClick={() => onEdit(expense)}
                title="Edit"
              >
                ✏️
              </button>
              <button
                className="btn-delete"
                onClick={() => onDelete(expense._id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExpenseList;
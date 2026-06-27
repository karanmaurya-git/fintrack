import React from 'react';

const CATEGORY_COLORS = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Entertainment: '#a855f7',
  Health: '#ef4444',
  Shopping: '#ec4899',
  Bills: '#64748b',
  Other: '#6b7280'
};

function SummaryBar({ expenses, total }) {
  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  // Category totals
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="summary-bar">
      <div className="summary-total">
        <span className="summary-label">Total Spent</span>
        <span className="summary-amount">{formatAmount(total)}</span>
      </div>
      <div className="summary-divider" />
      <div className="summary-categories">
        {topCategories.map(([cat, amt]) => (
          <div key={cat} className="summary-category">
            <span
              className="cat-dot"
              style={{ backgroundColor: CATEGORY_COLORS[cat] || '#888' }}
            />
            <span className="cat-name">{cat}</span>
            <span className="cat-amount">{formatAmount(amt)}</span>
          </div>
        ))}
        {topCategories.length === 0 && (
          <span className="no-data">No data yet</span>
        )}
      </div>
    </div>
  );
}

export default SummaryBar;

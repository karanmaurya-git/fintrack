import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from 'recharts';

const CATEGORY_COLORS = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Entertainment: '#a855f7',
  Health: '#ef4444',
  Shopping: '#ec4899',
  Bills: '#64748b',
  Other: '#6b7280'
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function Dashboard({ token }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/expenses', { headers: authHeaders() });
        const data = await res.json();
        setExpenses(data.expenses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const formatTooltip = (value) => formatAmount(value);

  // Filter by selected year
  const yearExpenses = expenses.filter(e => e.date?.startsWith(String(selectedYear)));

  // --- PIE CHART: spending by category ---
  const categoryData = Object.entries(
    yearExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // --- BAR CHART: monthly spending ---
  const monthlyData = MONTHS.map((month, i) => {
    const monthStr = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
    const total = yearExpenses
      .filter(e => e.date?.startsWith(monthStr))
      .reduce((sum, e) => sum + e.amount, 0);
    return { month, total };
  });

  // --- AREA CHART: cumulative spending over the year ---
  let cumulative = 0;
  const cumulativeData = monthlyData.map(({ month, total }) => {
    cumulative += total;
    return { month, cumulative, monthly: total };
  });

  // --- CATEGORY BAR: top categories this month ---
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = expenses.filter(e => e.date?.startsWith(thisMonth));
  const thisMonthByCategory = Object.entries(
    thisMonthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Stats
  const totalSpent = yearExpenses.reduce((s, e) => s + e.amount, 0);
  const avgMonthly = totalSpent / 12;
  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const topCategory = categoryData[0]?.name || '—';

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="dashboard">
      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">This Month</span>
          <span className="stat-value">{formatAmount(thisMonthTotal)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Year Total ({selectedYear})</span>
          <span className="stat-value">{formatAmount(totalSpent)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg / Month</span>
          <span className="stat-value">{formatAmount(avgMonthly)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Top Category</span>
          <span className="stat-value" style={{fontSize:'18px'}}>{topCategory}</span>
        </div>
      </div>

      {/* Year Selector */}
      <div className="chart-year-selector">
        <span className="filter-label">Year:</span>
        {years.map(y => (
          <button
            key={y}
            className={`filter-btn ${selectedYear === y ? 'active' : ''}`}
            onClick={() => setSelectedYear(y)}
          >{y}</button>
        ))}
      </div>

      <div className="charts-grid">
        {/* PIE CHART */}
        <div className="chart-card">
          <h3 className="chart-title">Spending by Category</h3>
          {categoryData.length === 0 ? (
            <div className="chart-empty">No data for {selectedYear}</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#888'} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* THIS MONTH BAR */}
        <div className="chart-card">
          <h3 className="chart-title">This Month by Category</h3>
          {thisMonthByCategory.length === 0 ? (
            <div className="chart-empty">No expenses this month</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={thisMonthByCategory} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} fontSize={11} />
                <YAxis type="category" dataKey="name" fontSize={12} width={90} />
                <Tooltip formatter={formatTooltip} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {thisMonthByCategory.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#888'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* MONTHLY BAR CHART */}
        <div className="chart-card chart-card-wide">
          <h3 className="chart-title">Monthly Spending — {selectedYear}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} fontSize={11} />
              <Tooltip formatter={formatTooltip} />
              <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CUMULATIVE AREA CHART */}
        <div className="chart-card chart-card-wide">
          <h3 className="chart-title">Cumulative Spending — {selectedYear}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={cumulativeData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} fontSize={11} />
              <Tooltip formatter={formatTooltip} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#colorCumulative)"
                name="Total Spent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

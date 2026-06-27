const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET all budgets for current month with spending
router.get('/', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budgets = await Budget.find({ user: req.user._id, month });

    // Get expenses for this month
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate spending per category
    const spending = {};
    expenses.forEach(e => {
      spending[e.category] = (spending[e.category] || 0) + e.amount;
    });

    const result = budgets.map(b => ({
      _id: b._id,
      category: b.category,
      limit: b.limit,
      month: b.month,
      spent: spending[b.category] || 0,
      percentage: Math.round(((spending[b.category] || 0) / b.limit) * 100)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST set/update budget
router.post('/', async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    if (!category || !limit || !month)
      return res.status(400).json({ message: 'Category, limit and month are required' });

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month },
      { limit: parseFloat(limit) },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE budget
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills', 'Other']
  },
  limit: {
    type: Number,
    required: true,
    min: [1, 'Budget must be at least 1']
  },
  month: {
    type: String, // format: "2026-06"
    required: true
  }
}, { timestamps: true });

// One budget per user per category per month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);

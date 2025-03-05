export const groupTransactionsByDate = (transactions) => {
    const grouped = {};
    transactions.forEach((transaction) => {
      if (!grouped[transaction.date]) {
        grouped[transaction.date] = [];
      }
      grouped[transaction.date].push(transaction);
    });
    return grouped;
  };
  
  export const calculateTotals = (transactions) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const outcome = transactions.filter(t => t.type === 'outcome').reduce((sum, t) => sum + t.amount, 0);
    const savings = transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
    return { income, outcome, savings };
  };
  
  export const calculateWeeklyTotals = (transactions) => {
    const weeklyTotals = {};
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!weeklyTotals[weekKey]) {
        weeklyTotals[weekKey] = { income: 0, outcome: 0, savings: 0 };
      }
      if (transaction.type === 'income') {
        weeklyTotals[weekKey].income += transaction.amount;
      } else if (transaction.type === 'outcome') {
        weeklyTotals[weekKey].outcome += transaction.amount;
      } else if (transaction.type === 'savings') {
        weeklyTotals[weekKey].savings += transaction.amount;
      }
    });
    return weeklyTotals;
  };
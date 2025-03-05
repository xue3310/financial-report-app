import { useState, useEffect } from 'react';
import { parseCurrencyInput } from '../utils/currencyFormatter';

const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    setCurrentMonth(new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }));
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (date, type, amount, description) => {
    const newTransaction = {
      id: Date.now(),
      date,
      type,
      amount: parseCurrencyInput(amount),
      description,
    };
    setTransactions([...transactions, newTransaction]);
  };

  const editTransaction = (updatedTransaction) => {
    const updatedTransactions = transactions.map(t =>
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    setTransactions(updatedTransactions);
  };

  const deleteTransaction = (id) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
  };

  const deleteMonthTransactions = () => {
    const currentMonthYear = new Date().toISOString().slice(0, 7);
    const updatedTransactions = transactions.filter(t => !t.date.startsWith(currentMonthYear));
    setTransactions(updatedTransactions);
  };

  return {
    transactions,
    currentMonth,
    addTransaction,
    editTransaction,
    deleteTransaction,
    deleteMonthTransactions,
  };
};

export default useTransactions;
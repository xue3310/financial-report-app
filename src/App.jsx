import React, { useState } from 'react';
import { Container, Paper, Typography, Button } from '@mui/material';
import useTransactions from './hooks/useTransactions';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import WeeklySummary from './components/WeeklySummary';
import EditDialog from './components/Dialogs/EditDialog';
import DeleteDialog from './components/Dialogs/DeleteDialog';
import SaveConfirmDialog from './components/Dialogs/SaveConfirmDialog';
import DeleteMonthDialog from './components/Dialogs/DeleteMonthDialog';
import SnackbarAlert from './components/SnackbarAlert';
import { generatePDF } from './utils/pdfGenerator';
import { formatCurrency } from './utils/currencyFormatter';

const App = () => {
  const {
    transactions,
    currentMonth,
    addTransaction,
    editTransaction: editTransactionHandler,
    deleteTransaction,
    deleteMonthTransactions,
  } = useTransactions();

  const [editTransaction, setEditTransaction] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSaveConfirmDialog, setOpenSaveConfirmDialog] = useState(false);
  const [openDeleteMonthDialog, setOpenDeleteMonthDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleEdit = (transaction) => {
    setEditTransaction({ ...transaction, amount: transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    editTransactionHandler(editTransaction);
    setOpenEditDialog(false);
    setOpenSaveConfirmDialog(false);
    showSnackbar('Transaksi berhasil diubah!', 'success');
  };

  const handleDelete = (id) => {
    deleteTransaction(id);
    setOpenDeleteDialog(false);
    showSnackbar('Transaksi berhasil dihapus!', 'success');
  };

  const handleDeleteMonth = () => {
    deleteMonthTransactions();
    setOpenDeleteMonthDialog(false);
    showSnackbar('Laporan bulan ini berhasil dihapus!', 'success');
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const calculateTotals = (transactions) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const outcome = transactions.filter(t => t.type === 'outcome').reduce((sum, t) => sum + t.amount, 0);
    const savings = transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
    return { income, outcome, savings };
  };

  const calculateTotalBalance = () => {
    const { income, outcome, savings } = calculateTotals(transactions);
    return income - outcome - savings;
  };

  const calculateWeeklyTotals = () => {
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

  const weeklyTotals = calculateWeeklyTotals();

  return (
    <Container className="mt-8 bg-gray-50 p-6 rounded-lg shadow-lg">
      <Paper className="p-6 bg-white rounded-lg shadow-md">
        <Typography variant="h4" className="mb-6 text-center font-bold text-blue-600">
          Laporan Keuangan Bulan {currentMonth}
        </Typography>

        {/* Kotak Total */}
        <section className="p-4 mb-6 bg-blue-50 rounded-lg shadow-sm mt-5 border border-blue-300">
          <Typography variant="h6" className="font-semibold text-gray-800">
            Total Uang Sekarang: {formatCurrency(calculateTotalBalance())}
          </Typography>
          <Typography variant="body1">Total Pemasukan: {formatCurrency(calculateTotals(transactions).income)}</Typography>
          <Typography variant="body1">Total Tabungan: {formatCurrency(calculateTotals(transactions).savings)}</Typography>
          <Typography variant="body1">Total Pengeluaran: {formatCurrency(calculateTotals(transactions).outcome)}</Typography>
          <section className='my-5 flex flex-col gap-3'>
            <Button className='w-full' variant="contained" color="secondary" onClick={() => setOpenDeleteMonthDialog(true)} style={{ backgroundColor: '#f44336', color: '#fff' }}>
              Hapus Laporan Bulan Ini
            </Button>
            <Button variant="contained" color="primary" onClick={() => generatePDF(transactions, currentMonth)} className="w-full">Cetak PDF</Button>
          </section>
        </section>

        {/* Ringkasan Mingguan */}
        <WeeklySummary weeklyTotals={weeklyTotals} />

        {/* Form Transaksi */}
        <TransactionForm onAddTransaction={addTransaction} />

        {/* Daftar Transaksi */}
        <TransactionList transactions={transactions} onEdit={handleEdit} onDelete={(id) => { setTransactionToDelete(id); setOpenDeleteDialog(true); }} />

        {/* Dialog Edit */}
        <EditDialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} transaction={editTransaction} onSave={handleSaveEdit} />

        {/* Dialog Konfirmasi Simpan Edit */}
        <SaveConfirmDialog open={openSaveConfirmDialog} onClose={() => setOpenSaveConfirmDialog(false)} onSave={handleSaveEdit} />

        {/* Dialog Konfirmasi Hapus */}
        <DeleteDialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} onDelete={() => handleDelete(transactionToDelete)} />

        {/* Dialog Konfirmasi Hapus Laporan Bulan Ini */}
        <DeleteMonthDialog open={openDeleteMonthDialog} onClose={() => setOpenDeleteMonthDialog(false)} onDelete={handleDeleteMonth} />

        {/* Snackbar untuk Feedback */}
        <SnackbarAlert open={snackbarOpen} onClose={() => setSnackbarOpen(false)} message={snackbarMessage} severity={snackbarSeverity} />
      </Paper>
    </Container>
  );
};

export default App;
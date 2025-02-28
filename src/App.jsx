import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Typography, Paper, Container, Grid, Select, MenuItem, InputLabel, FormControl,
  Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert
} from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatCurrencyInput = (value) => {
  const numericValue = value.replace(/[^0-9]/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseCurrencyInput = (value) => Math.floor(parseFloat(value.replace(/\./g, '') || 0));

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [currentMonth, setCurrentMonth] = useState('');
  const [editTransaction, setEditTransaction] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSaveConfirmDialog, setOpenSaveConfirmDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Ambil data dari localStorage saat komponen pertama kali di-render
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    setCurrentMonth(new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }));
  }, []);

  // Simpan data ke localStorage setiap kali transactions berubah
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    if (!date || !description || !amount) {
      showSnackbar('Harap isi semua field!', 'error');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      date,
      type,
      amount: parseCurrencyInput(amount),
      description,
    };
    setTransactions([...transactions, newTransaction]);
    setDescription('');
    setAmount('');
    showSnackbar('Transaksi berhasil ditambahkan!', 'success');
  };

  const handleEdit = (transaction) => {
    setEditTransaction({ ...transaction, amount: transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    const updatedTransaction = {
      ...editTransaction,
      amount: parseCurrencyInput(editTransaction.amount),
    };
    const updatedTransactions = transactions.map(t =>
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    setTransactions(updatedTransactions);
    setOpenEditDialog(false);
    setOpenSaveConfirmDialog(false);
    showSnackbar('Transaksi berhasil diubah!', 'success');
  };

  const handleDelete = (id) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    setOpenDeleteDialog(false);
    showSnackbar('Transaksi berhasil dihapus!', 'success');
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const groupTransactionsByDate = () => {
    const grouped = {};
    transactions.forEach((transaction) => {
      if (!grouped[transaction.date]) {
        grouped[transaction.date] = [];
      }
      grouped[transaction.date].push(transaction);
    });
    return grouped;
  };

  const calculateTotals = (transactions) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const outcome = transactions.filter(t => t.type === 'outcome').reduce((sum, t) => sum + t.amount, 0);
    return { income, outcome };
  };

  const calculateTotalBalance = () => {
    const { income, outcome } = calculateTotals(transactions);
    return income - outcome;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const groupedTransactions = groupTransactionsByDate();

    let startY = 20;

    Object.keys(groupedTransactions).forEach((date) => {
      const transactions = groupedTransactions[date];
      const headers = [['Tanggal', 'Jenis', 'Deskripsi', 'Jumlah']];
      const data = transactions.map((t) => [
        formatDate(t.date),
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.description,
        formatCurrency(t.amount),
      ]);

      doc.setFontSize(14);
      doc.text(`Tanggal: ${formatDate(date)}`, 14, startY);
      startY += 10;

      (doc).autoTable({
        startY,
        head: headers,
        body: data,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [22, 160, 133] },
      });

      const { income, outcome } = calculateTotals(transactions);
      startY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Total Pemasukan: ${formatCurrency(income)}`, 14, startY);
      startY += 10;
      doc.text(`Total Pengeluaran: ${formatCurrency(outcome)}`, 14, startY);
      startY += 10;
      doc.text(`Sisa Uang: ${formatCurrency(income - outcome)}`, 14, startY);
      startY += 20;
    });

    doc.save(`laporan-keuangan-${currentMonth}.pdf`);
  };

  const groupedTransactions = groupTransactionsByDate();

  return (
    <Container className="mt-8 bg-gray-50 p-6 rounded-lg shadow-lg">
      <Paper className="p-6 bg-white rounded-lg shadow-md">
        <Typography variant="h4" className="mb-6 text-center font-bold text-blue-600">
          Laporan Keuangan Bulan {currentMonth}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField label="Tanggal" type="date" fullWidth value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Jumlah" fullWidth value={amount} onChange={(e) => setAmount(formatCurrencyInput(e.target.value))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Deskripsi" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Jenis Transaksi</InputLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)} label="Jenis Transaksi">
                <MenuItem value="income">Pemasukan</MenuItem>
                <MenuItem value="outcome">Pengeluaran</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={addTransaction}>Tambah Transaksi</Button>
          </Grid>
        </Grid>

        {/* Total Uang Sekarang */}
        <Typography variant="h6" className="mt-6 font-semibold text-gray-800">
          Total Uang Sekarang: {formatCurrency(calculateTotalBalance())}
        </Typography>

        {Object.keys(groupedTransactions).map((date) => {
          const transactions = groupedTransactions[date];
          const { income, outcome } = calculateTotals(transactions);
          return (
            <Paper key={date} className="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm">
              <Typography variant="h6" className="mb-4 font-semibold text-gray-800">
                Tanggal: {formatDate(date)}
              </Typography>
              {transactions.map((transaction) => (
                <div key={transaction.id} className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                  <Typography variant="body1">Jenis: {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</Typography>
                  <Typography variant="body1">Deskripsi: {transaction.description}</Typography>
                  <Typography variant="body1">Jumlah: {formatCurrency(transaction.amount)}</Typography>
                  <Button variant="contained" color="primary" onClick={() => handleEdit(transaction)}>Edit</Button>
                  <Button variant="contained" color="secondary" onClick={() => { setTransactionToDelete(transaction.id); setOpenDeleteDialog(true); }}>Hapus</Button>
                </div>
              ))}
              <Typography variant="body1">Total Pemasukan: {formatCurrency(income)}</Typography>
              <Typography variant="body1">Total Pengeluaran: {formatCurrency(outcome)}</Typography>
            </Paper>
          );
        })}

        <Button variant="contained" color="secondary" onClick={generatePDF} className="w-full mt-6">Cetak PDF</Button>
      </Paper>

      {/* Dialog Edit */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Transaksi</DialogTitle>
        <DialogContent>
          <TextField
            label="Tanggal"
            type="date"
            fullWidth
            value={editTransaction?.date || ''}
            onChange={(e) => setEditTransaction({ ...editTransaction, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            className="mt-4"
          />
          <TextField
            label="Jumlah"
            fullWidth
            value={editTransaction?.amount || ''}
            onChange={(e) => setEditTransaction({ ...editTransaction, amount: formatCurrencyInput(e.target.value) })}
            className="mt-4"
          />
          <TextField
            label="Deskripsi"
            fullWidth
            value={editTransaction?.description || ''}
            onChange={(e) => setEditTransaction({ ...editTransaction, description: e.target.value })}
            className="mt-4"
          />
          <FormControl fullWidth className="mt-4">
            <InputLabel>Jenis Transaksi</InputLabel>
            <Select
              value={editTransaction?.type || 'income'}
              onChange={(e) => setEditTransaction({ ...editTransaction, type: e.target.value })}
              label="Jenis Transaksi"
            >
              <MenuItem value="income">Pemasukan</MenuItem>
              <MenuItem value="outcome">Pengeluaran</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Batal</Button>
          <Button onClick={() => setOpenSaveConfirmDialog(true)}>Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Konfirmasi Simpan Edit */}
      <Dialog open={openSaveConfirmDialog} onClose={() => setOpenSaveConfirmDialog(false)}>
        <DialogTitle>Konfirmasi Simpan</DialogTitle>
        <DialogContent>
          <Typography>Apakah Anda yakin ingin menyimpan perubahan ini?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveConfirmDialog(false)}>Batal</Button>
          <Button onClick={handleSaveEdit} color="primary">Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>Apakah Anda yakin ingin menghapus transaksi ini?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Batal</Button>
          <Button onClick={() => handleDelete(transactionToDelete)} color="secondary">Hapus</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar untuk Feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default App;
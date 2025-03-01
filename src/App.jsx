import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Typography, Paper, Container, Grid, Select, MenuItem, InputLabel, FormControl,
  Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert
} from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [openDeleteMonthDialog, setOpenDeleteMonthDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

  const addTransaction = () => {
    if (!date || !amount) {
      showSnackbar('Harap isi field!', 'error');
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

  const handleDeleteMonth = () => {
    const currentMonthYear = new Date().toISOString().slice(0, 7);
    const updatedTransactions = transactions.filter(t => !t.date.startsWith(currentMonthYear));
    setTransactions(updatedTransactions);
    setOpenDeleteMonthDialog(false);
    showSnackbar('Laporan bulan ini berhasil dihapus!', 'success');
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
    const savings = transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
    return { income, outcome, savings };
  };
  
  const calculateTotalBalance = () => {
    const { income, outcome,savings } = calculateTotals(transactions); // Hanya ambil income dan outcome
    return income - outcome - savings; // Total uang sekarang = pemasukan - pengeluaran
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const groupedTransactions = groupTransactionsByDate();
    const weeklyTotals = calculateWeeklyTotals(); // Ambil ringkasan mingguan
  
    console.log(groupedTransactions); // Debugging: Cek isi groupedTransactions
    console.log(weeklyTotals); // Debugging: Cek ringkasan mingguan
  
    // Jika tidak ada transaksi, buat PDF kosong
    if (Object.keys(groupedTransactions).length === 0) {
      doc.text("Tidak ada transaksi untuk dicetak.", 14, 20);
      doc.save(`laporan-keuangan-${currentMonth}.pdf`);
      return;
    }
  
    let startY = 20;
  
    // Cetak transaksi harian
    Object.keys(groupedTransactions).forEach((date) => {
      const transactions = groupedTransactions[date];
      if (!transactions || transactions.length === 0) return; // Skip jika tidak ada transaksi
  
      const headers = [['Tanggal', 'Jenis', 'Deskripsi', 'Jumlah']];
      const data = transactions.map((t) => [
        formatDate(t.date),
        t.type === 'income' ? 'Pemasukan' : t.type === 'outcome' ? 'Pengeluaran' : 'Tabungan',
        t.description,
        formatCurrency(t.amount),
      ]);
  
      doc.setFontSize(14);
      doc.text(`Tanggal: ${formatDate(date)}`, 14, startY);
      startY += 10;
  
      autoTable(doc, {
        startY,
        head: headers,
        body: data,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [22, 160, 133] },
      });
  
      const { income, outcome, savings } = calculateTotals(transactions);
      startY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Total Pemasukan: ${formatCurrency(income)}`, 14, startY);
      startY += 10;
      doc.text(`Total Pengeluaran: ${formatCurrency(outcome)}`, 14, startY);
      startY += 10;
      doc.text(`Total Tabungan: ${formatCurrency(savings)}`, 14, startY);
      startY += 10;
      doc.text(`Sisa Uang: ${formatCurrency(income - outcome + savings)}`, 14, startY);
      startY += 20;
    });
  
    // Cetak ringkasan mingguan
    if (Object.keys(weeklyTotals).length > 0) {
      doc.addPage(); // Tambahkan halaman baru untuk ringkasan mingguan
      startY = 20;
  
      doc.setFontSize(16);
      doc.text(`Ringkasan Mingguan - ${currentMonth}`, 14, startY);
      startY += 10;
  
      Object.keys(weeklyTotals).forEach((weekKey, index) => {
        const { income, outcome, savings } = weeklyTotals[weekKey];
  
        doc.setFontSize(14);
        doc.text(`Minggu ke-${index + 1}`, 14, startY);
        startY += 10;
  
        const headers = [['Jenis', 'Total']];
        const data = [
          ['Pemasukan', formatCurrency(income)],
          ['Pengeluaran', formatCurrency(outcome)],
          ['Tabungan', formatCurrency(savings)],
        ];
  
        autoTable(doc, {
          startY,
          head: headers,
          body: data,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [22, 160, 133] },
        });
  
        startY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text(`Sisa Uang: ${formatCurrency(income - outcome + savings)}`, 14, startY);
        startY += 20;
      });
    }
  
    // Simpan PDF
    doc.save(`laporan-keuangan-${currentMonth}.pdf`);
  };

  const groupedTransactions = groupTransactionsByDate();

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
            <Button variant="contained" color="primary" onClick={generatePDF} className="w-full">Cetak PDF</Button>
          </section>
        </section>

        {/* Kotak Mingguan */}
        {Object.keys(weeklyTotals).length > 0 && (
          <>
            <Typography variant="h5" className="mt-6 pb-2 text-center font-bold text-green-600">
              Ringkasan Mingguan
            </Typography>
            <section className='grid grid-cols-1 gap-2'>
              {Object.keys(weeklyTotals).map((weekKey, index) => (
                <Paper key={weekKey} className="p-4 mb-6 rounded-lg shadow-sm border border-blue-300">
                  <Typography variant="h6" className="font-semibold text-gray-800">
                    Minggu ke {index + 1}
                  </Typography>
                  <Typography variant="body1">Total Pemasukan: {formatCurrency(weeklyTotals[weekKey].income)}</Typography>
                  <Typography variant="body1">Total Tabungan: {formatCurrency(weeklyTotals[weekKey].savings)}</Typography>
                  <Typography variant="body1">Total Pengeluaran: {formatCurrency(weeklyTotals[weekKey].outcome)}</Typography>
                </Paper>
              ))}
            </section>
          </>
        )}

        {/* Transaksi Harian */}
        <Typography variant="h5" className="mt-6 pb-2 text-center font-bold text-green-600">
          Transaksi Harian
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
                <MenuItem value="savings">Tabungan</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button className='w-full' variant="contained" color="primary" onClick={addTransaction}>Tambah Transaksi</Button>
          </Grid>
        </Grid>

        {/* Detail Laporan Keuangan */}
        <Typography variant="h5" className="pt-10 text-center font-bold text-green-600">
          Detail Laporan Keuangan
        </Typography>
        {Object.keys(groupedTransactions).map((date) => {
          const transactions = groupedTransactions[date];
          const { income, outcome, savings } = calculateTotals(transactions);
          return (
            <Paper key={date} className="my-8 p-4 bg-gray-100 rounded-lg shadow-sm border border-green-300">
              <Typography variant="h6" className="mb-4 font-semibold text-gray-800">
                Tanggal: {formatDate(date)}
              </Typography>
              {transactions.map((transaction) => (
                <div key={transaction.id} className="mb-4 bg-white border-b border-gray-400">
                  <Typography variant="body1">Jenis: {transaction.type === 'income' ? 'Pemasukan' : transaction.type === 'outcome' ? 'Pengeluaran' : 'Tabungan'}</Typography>
                  <Typography variant="body1">Deskripsi: {transaction.description}</Typography>
                  <Typography variant="body1">Jumlah: {formatCurrency(transaction.amount)}</Typography>
                  <section className='my-2 flex gap-3'>
                    <Button variant="contained" style={{ backgroundColor: '#ffeb3b', color: '#000' }} onClick={() => handleEdit(transaction)}>Edit</Button>
                    <Button variant="contained" style={{ backgroundColor: '#f44336', color: '#fff' }} onClick={() => { setTransactionToDelete(transaction.id); setOpenDeleteDialog(true); }}>Hapus</Button>
                  </section>
                </div>
              ))}
              <Typography variant="body1">Total Pemasukan: {formatCurrency(income)}</Typography>
              <Typography variant="body1">Total Pengeluaran: {formatCurrency(outcome)}</Typography>
              <Typography variant="body1">Total Tabungan: {formatCurrency(savings)}</Typography>
            </Paper>
          );
        })}
      </Paper>

      {/* Dialog Edit */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Transaksi</DialogTitle>
        <DialogContent style={{ padding: '20px' }} className='my-5 flex flex-col gap-3 w-full'>
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
              <MenuItem value="savings">Tabungan</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions style={{ padding: '20px' }}>
          <Button onClick={() => setOpenEditDialog(false)} style={{ backgroundColor: '#2196f3', color: '#fff' }}>Batal</Button>
          <Button onClick={() => setOpenSaveConfirmDialog(true)} style={{ backgroundColor: '#4caf50', color: '#fff' }}>Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Konfirmasi Simpan Edit */}
      <Dialog open={openSaveConfirmDialog} onClose={() => setOpenSaveConfirmDialog(false)}>
        <DialogTitle>Konfirmasi Simpan</DialogTitle>
        <DialogContent style={{ padding: '20px' }}>
          <Typography>Apakah Anda yakin ingin menyimpan perubahan ini?</Typography>
        </DialogContent>
        <DialogActions style={{ padding: '20px' }}>
          <Button onClick={() => setOpenSaveConfirmDialog(false)} style={{ backgroundColor: '#2196f3', color: '#fff' }}>Batal</Button>
          <Button onClick={handleSaveEdit} style={{ backgroundColor: '#4caf50', color: '#fff' }}>Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent style={{ padding: '20px' }}>
          <Typography>Apakah Anda yakin ingin menghapus transaksi ini?</Typography>
        </DialogContent>
        <DialogActions style={{ padding: '20px' }}>
          <Button onClick={() => setOpenDeleteDialog(false)} style={{ backgroundColor: '#2196f3', color: '#fff' }}>Batal</Button>
          <Button onClick={() => handleDelete(transactionToDelete)} style={{ backgroundColor: '#f44336', color: '#fff' }}>Hapus</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Laporan Bulan Ini */}
      <Dialog open={openDeleteMonthDialog} onClose={() => setOpenDeleteMonthDialog(false)}>
        <DialogTitle>Konfirmasi Hapus Laporan Bulan Ini</DialogTitle>
        <DialogContent style={{ padding: '20px' }}>
          <Typography>Apakah Anda yakin ingin menghapus semua transaksi pada bulan ini?</Typography>
        </DialogContent>
        <DialogActions style={{ padding: '20px' }}>
          <Button onClick={() => setOpenDeleteMonthDialog(false)} style={{ backgroundColor: '#2196f3', color: '#fff' }}>Batal</Button>
          <Button onClick={handleDeleteMonth} style={{ backgroundColor: '#f44336', color: '#fff' }}>Hapus</Button>
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
import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Paper, Container, Grid, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './tailwind.css';

interface Transaction {
  id: number;
  date: string; // Format: YYYY-MM-DD
  type: 'income' | 'outcome';
  amount: number;
  description: string;
}

// Fungsi untuk memformat nominal uang dengan titik sebagai pemisah ribuan
const formatCurrencyInput = (value: string): string => {
  const numericValue = value.replace(/[^0-9]/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Fungsi untuk mengubah format uang ke angka (misal: "100.000" -> 100000)
const parseCurrencyInput = (value: string): number => {
  return parseFloat(value.replace(/\./g, ''));
};

// Fungsi untuk memformat tanggal menjadi format Indonesia (contoh: 2 Feb 2025)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'income' | 'outcome'>('income');
  const [currentMonth, setCurrentMonth] = useState<string>('');

  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    const date = new Date();
    setCurrentMonth(date.toLocaleString('id-ID', { month: 'long', year: 'numeric' }));
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    const newTransaction: Transaction = {
      id: Date.now(),
      date,
      type,
      amount: parseCurrencyInput(amount),
      description,
    };
    setTransactions([...transactions, newTransaction]);
    setDescription('');
    setAmount('');
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  };

  // Mengelompokkan transaksi berdasarkan tanggal
  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: Transaction[] } = {};
    transactions.forEach((transaction) => {
      if (!grouped[transaction.date]) {
        grouped[transaction.date] = [];
      }
      grouped[transaction.date].push(transaction);
    });
    return grouped;
  };

  // Menghitung total pemasukan dan pengeluaran per tanggal
  const calculateTotals = (transactions: Transaction[]) => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const outcome = transactions
      .filter((t) => t.type === 'outcome')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, outcome };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const title = `Laporan Keuangan Bulan ${currentMonth}`;
    const groupedTransactions = groupTransactionsByDate();

    let startY = 20; // Posisi awal untuk konten PDF

    Object.keys(groupedTransactions).forEach((date) => {
      const transactions = groupedTransactions[date];
      const headers = [['Tanggal', 'Jenis', 'Deskripsi', 'Jumlah']];
      const data = transactions.map((t) => [
        formatDate(t.date),
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.description,
        formatCurrency(t.amount),
      ]);

      // Add tanggal sebagai judul
      doc.setFontSize(14);
      doc.text(`Tanggal: ${formatDate(date)}`, 14, startY);
      startY += 10;

      // Add tabel
      (doc as any).autoTable({
        startY,
        head: headers,
        body: data,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [22, 160, 133] },
      });

      // Hitung total pemasukan dan pengeluaran
      const { income, outcome } = calculateTotals(transactions);
      startY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Total Pemasukan: ${formatCurrency(income)}`, 14, startY);
      startY += 10;
      doc.text(`Total Pengeluaran: ${formatCurrency(outcome)}`, 14, startY);
      startY += 10;
      doc.text(`Sisa Uang: ${formatCurrency(income - outcome)}`, 14, startY);
      startY += 20; // Beri jarak untuk tanggal berikutnya
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
            <TextField
              label="Tanggal"
              type="date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              className="bg-white"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Jumlah"
              fullWidth
              value={amount}
              onChange={(e) => {
                const formattedValue = formatCurrencyInput(e.target.value);
                setAmount(formattedValue);
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setAmount('0');
                }
              }}
              className="bg-white"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Deskripsi"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth className="bg-white rounded">
              <InputLabel>Jenis Transaksi</InputLabel>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as 'income' | 'outcome')}
                label="Jenis Transaksi"
              >
                <MenuItem value="income">Pemasukan</MenuItem>
                <MenuItem value="outcome">Pengeluaran</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={addTransaction}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Tambah Transaksi
            </Button>
          </Grid>
        </Grid>

        {/* Tabel Transaksi per Tanggal */}
        {Object.keys(groupedTransactions).map((date) => {
          const transactions = groupedTransactions[date];
          const { income, outcome } = calculateTotals(transactions);
          return (
            <Paper key={date} className="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm">
              <Typography variant="h6" className="mb-4 font-semibold text-gray-800">
                Tanggal: {formatDate(date)}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow className="bg-blue-100">
                      <TableCell className="font-bold">Jenis</TableCell>
                      <TableCell className="font-bold">Deskripsi</TableCell>
                      <TableCell className="font-bold">Jumlah</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id} className="hover:bg-gray-50">
                        <TableCell>{t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell>{formatCurrency(t.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <div className="mt-4 space-y-2">
                <Typography variant="body1" className="text-green-600">
                  Total Pemasukan: {formatCurrency(income)}
                </Typography>
                <Typography variant="body1" className="text-red-600">
                  Total Pengeluaran: {formatCurrency(outcome)}
                </Typography>
                <Typography variant="body1" className="text-blue-600">
                  Sisa Uang: {formatCurrency(income - outcome)}
                </Typography>
              </div>
            </Paper>
          );
        })}

        <Button
          variant="contained"
          color="secondary"
          onClick={generatePDF}
          className="w-full mt-6 bg-green-600 hover:bg-green-700"
        >
          Cetak PDF
        </Button>
      </Paper>
    </Container>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Paper, Container, Grid, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
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

const parseCurrencyInput = (value: string): number => {
  return parseFloat(value.replace(/\./g, '')) || 0;
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'income' | 'outcome'>('income');
  const currentMonth = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const title = `Laporan Keuangan Bulan ${currentMonth}`;
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.save(`laporan-keuangan-${currentMonth}.pdf`);
  };

  return (
    <Container className="mt-8 bg-gray-50 p-6 rounded-lg shadow-lg">
      <Paper className="p-6 bg-white rounded-lg shadow-md">
        <Typography variant="h4" className="mb-6 text-center font-bold text-blue-600">
          Laporan Keuangan Bulan {currentMonth}
        </Typography>
        <Grid container spacing={2} className="mb-4">
          <Grid item xs={12} sm={6}>
            <TextField
              label="Deskripsi"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Jumlah"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Jenis</InputLabel>
              <Select value={type} onChange={(e) => setType(e.target.value as 'income' | 'outcome')}>
                <MenuItem value="income">Pemasukan</MenuItem>
                <MenuItem value="outcome">Pengeluaran</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Tanggal"
              type="date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" fullWidth onClick={addTransaction}>
              Tambah Transaksi
            </Button>
          </Grid>
        </Grid>
        <Button variant="contained" color="secondary" onClick={generatePDF} className="w-full mt-6 bg-green-600 hover:bg-green-700">
          Cetak PDF
        </Button>
      </Paper>
    </Container>
  );
};

export default App;

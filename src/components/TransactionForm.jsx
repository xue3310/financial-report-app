import React, { useState } from 'react';
import { TextField, Button, Grid, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { formatCurrencyInput } from '../utils/currencyFormatter';

const TransactionForm = ({ onAddTransaction }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');

  const handleSubmit = () => {
    onAddTransaction(date, type, amount, description);
    setDescription('');
    setAmount('');
  };

  return (
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
        <Button className='w-full' variant="contained" color="primary" onClick={handleSubmit}>Tambah Transaksi</Button>
      </Grid>
    </Grid>
  );
};

export default TransactionForm;
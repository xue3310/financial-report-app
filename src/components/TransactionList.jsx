import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import { formatDate, formatCurrency } from '../utils/currencyFormatter'; // Correct import
import { groupTransactionsByDate, calculateTotals } from '../utils/transactionHelpers';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <>
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
                  <Button variant="contained" style={{ backgroundColor: '#ffeb3b', color: '#000' }} onClick={() => onEdit(transaction)}>Edit</Button>
                  <Button variant="contained" style={{ backgroundColor: '#f44336', color: '#fff' }} onClick={() => onDelete(transaction.id)}>Hapus</Button>
                </section>
              </div>
            ))}
            <Typography variant="body1">Total Pemasukan: {formatCurrency(income)}</Typography>
            <Typography variant="body1">Total Pengeluaran: {formatCurrency(outcome)}</Typography>
            <Typography variant="body1">Total Tabungan: {formatCurrency(savings)}</Typography>
          </Paper>
        );
      })}
    </>
  );
};

export default TransactionList;
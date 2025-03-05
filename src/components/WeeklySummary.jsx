import React from 'react';
import { Paper, Typography } from '@mui/material';
import { formatCurrency } from '../utils/currencyFormatter';

const WeeklySummary = ({ weeklyTotals }) => {
  return (
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
  );
};

export default WeeklySummary;
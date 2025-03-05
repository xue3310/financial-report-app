import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const DeleteMonthDialog = ({ open, onClose, onDelete }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Konfirmasi Hapus Laporan Bulan Ini</DialogTitle>
      <DialogContent style={{ padding: '20px' }}>
        <Typography>Apakah Anda yakin ingin menghapus semua transaksi pada bulan ini?</Typography>
      </DialogContent>
      <DialogActions style={{ padding: '20px' }}>
        <Button onClick={onClose} style={{ backgroundColor: '#2196f3', color: '#fff' }}>Batal</Button>
        <Button onClick={onDelete} style={{ backgroundColor: '#f44336', color: '#fff' }}>Hapus</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteMonthDialog;
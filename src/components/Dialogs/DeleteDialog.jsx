import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const DeleteDialog = ({ open, onClose, onDelete }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Konfirmasi Hapus</DialogTitle>
      <DialogContent style={{ padding: '20px' }}>
        <Typography>Apakah Anda yakin ingin menghapus transaksi ini?</Typography>
      </DialogContent>
      <DialogActions style={{ padding: '20px' }}>
        <Button onClick={onClose} style={{ backgroundColor: '#2196f3', color: '#fff' }}>Batal</Button>
        <Button onClick={onDelete} style={{ backgroundColor: '#f44336', color: '#fff' }}>Hapus</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
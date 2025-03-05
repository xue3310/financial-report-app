import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const SaveConfirmDialog = ({ open, onClose, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Konfirmasi Simpan</DialogTitle>
      <DialogContent style={{ padding: '20px' }}>
        <Typography>Apakah Anda yakin ingin menyimpan perubahan ini?</Typography>
      </DialogContent>
      <DialogActions style={{ padding: '20px' }}>
        <Button onClick={onClose} style={{ backgroundColor: '#2196f3', color: '#fff' }}>Batal</Button>
        <Button onClick={onSave} style={{ backgroundColor: '#4caf50', color: '#fff' }}>Simpan</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveConfirmDialog;
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { formatCurrencyInput } from '../../utils/currencyFormatter';

const EditDialog = ({ open, onClose, transaction, onSave }) => {
  const [editedTransaction, setEditedTransaction] = React.useState(transaction);

  const handleSave = () => {
    onSave(editedTransaction);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Transaksi</DialogTitle>
      <DialogContent style={{ padding: '20px' }} className='my-5 flex flex-col gap-3 w-full'>
        <TextField
          label="Tanggal"
          type="date"
          fullWidth
          value={editedTransaction?.date || ''}
          onChange={(e) => setEditedTransaction({ ...editedTransaction, date: e.target.value })}
          InputLabelProps={{ shrink: true }}
          className="mt-4"
        />
        <TextField
          label="Jumlah"
          fullWidth
          value={editedTransaction?.amount || ''}
          onChange={(e) => setEditedTransaction({ ...editedTransaction, amount: formatCurrencyInput(e.target.value) })}
          className="mt-4"
        />
        <TextField
          label="Deskripsi"
          fullWidth
          value={editedTransaction?.description || ''}
          onChange={(e) => setEditedTransaction({ ...editedTransaction, description: e.target.value })}
          className="mt-4"
        />
        <FormControl fullWidth className="mt-4">
          <InputLabel>Jenis Transaksi</InputLabel>
          <Select
            value={editedTransaction?.type || 'income'}
            onChange={(e) => setEditedTransaction({ ...editedTransaction, type: e.target.value })}
            label="Jenis Transaksi"
          >
            <MenuItem value="income">Pemasukan</MenuItem>
            <MenuItem value="outcome">Pengeluaran</MenuItem>
            <MenuItem value="savings">Tabungan</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions style={{ padding: '20px' }}>
        <Button onClick={onClose} style={{ backgroundColor: '#2196f3', color: '#fff' }}>Batal</Button>
        <Button onClick={handleSave} style={{ backgroundColor: '#4caf50', color: '#fff' }}>Simpan</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;
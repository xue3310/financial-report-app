import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate, formatCurrency } from './currencyFormatter';
import { groupTransactionsByDate, calculateTotals, calculateWeeklyTotals } from './transactionHelpers';

export const generatePDF = (transactions, currentMonth) => {
  const doc = new jsPDF();
  const groupedTransactions = groupTransactionsByDate(transactions);
  const weeklyTotals = calculateWeeklyTotals(transactions);

  if (Object.keys(groupedTransactions).length === 0) {
    doc.text("Tidak ada transaksi untuk dicetak.", 14, 20);
    doc.save(`laporan-keuangan-${currentMonth}.pdf`);
    return;
  }

  let startY = 20;

  // 1. Cetak Ringkasan Bulanan (Halaman 1)
  doc.setFontSize(16);
  doc.text(`Ringkasan Bulanan - ${currentMonth}`, 14, startY);
  startY += 10;

  const { income: totalIncome, outcome: totalOutcome, savings: totalSavings } = calculateTotals(transactions);
  const totalBalance = totalIncome - totalOutcome - totalSavings;

  autoTable(doc, {
    startY,
    head: [['Jenis', 'Total']],
    body: [
      ['Total Pemasukan', formatCurrency(totalIncome)],
      ['Total Pengeluaran', formatCurrency(totalOutcome)],
      ['Total Tabungan', formatCurrency(totalSavings)],
      ['Sisa Uang', formatCurrency(totalBalance)], // Sisa uang hanya di ringkasan bulanan
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  // 2. Cetak Ringkasan Mingguan (Halaman 2)
  if (Object.keys(weeklyTotals).length > 0) {
    doc.addPage();
    startY = 20;

    doc.setFontSize(16);
    doc.text(`Ringkasan Mingguan - ${currentMonth}`, 14, startY);
    startY += 10;

    Object.keys(weeklyTotals).forEach((weekKey, index) => {
      const { income, outcome, savings } = weeklyTotals[weekKey];

      doc.setFontSize(14);
      doc.text(`Minggu ke-${index + 1}`, 14, startY);
      startY += 10;

      autoTable(doc, {
        startY,
        head: [['Jenis', 'Total']],
        body: [
          ['Pemasukan', formatCurrency(income)],
          ['Pengeluaran', formatCurrency(outcome)],
          ['Tabungan', formatCurrency(savings)],
        ], // Tidak ada "Sisa Uang"
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [22, 160, 133] },
      });

      startY = doc.lastAutoTable.finalY + 20;
    });
  }

  // 3. Cetak Detail Harian (Halaman 3 dan seterusnya)
  doc.addPage();
  startY = 20;

  // **Urutkan tanggal dari paling lama ke paling baru**
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(a) - new Date(b));

  sortedDates.forEach((date) => {
    const transactions = groupedTransactions[date];
    if (!transactions || transactions.length === 0) return;

    doc.setFontSize(14);
    doc.text(`Tanggal: ${formatDate(date)}`, 14, startY);
    startY += 10;

    autoTable(doc, {
      startY,
      head: [['Tanggal', 'Jenis', 'Deskripsi', 'Jumlah']],
      body: transactions.map((t) => [
        formatDate(t.date),
        t.type === 'income' ? 'Pemasukan' : t.type === 'outcome' ? 'Pengeluaran' : 'Tabungan',
        t.description,
        formatCurrency(t.amount),
      ]),
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    startY = doc.lastAutoTable.finalY + 20;

    if (startY > 260) {
      doc.addPage();
      startY = 20;
    }
  });

  // Simpan PDF
  doc.save(`laporan-keuangan-${currentMonth}.pdf`);
};

// Format currency input
export const formatCurrencyInput = (value) => {
  const numericValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Add thousand separators
};

// Parse currency input
export const parseCurrencyInput = (value) => {
    return Math.floor(parseFloat(value.replace(/\./g, '') || 0));
  };
  

// Format currency for display
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
};

// Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};
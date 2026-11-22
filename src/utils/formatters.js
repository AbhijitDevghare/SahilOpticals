export const formatCurrency = (amount) => {
  const numeric = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numeric);
};

export const formatExactCurrency = (amount) => {
  const numeric = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
};

export const hasPrescriptionDetails = (rx) => {
  if (!rx || typeof rx !== 'object') return false;
  const checkEye = (eye) =>
    Boolean(eye && (eye.sph || eye.cyl || eye.axis || eye.add || eye.va));
  return Boolean(
    checkEye(rx.rightEye) ||
      checkEye(rx.leftEye) ||
      rx.pdDistance ||
      rx.pdNear ||
      rx.lensType ||
      rx.remarks
  );
};

export const formatCompactCurrency = (amount) => {
  const numeric = Number(amount || 0);
  if (numeric >= 100000) {
    return `₹${(numeric / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  }
  if (numeric >= 1000) {
    return `₹${(numeric / 1000).toFixed(0)}k`;
  }
  return `₹${numeric}`;
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const toLocalDateInputValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTodayLabel = () => {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SO';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

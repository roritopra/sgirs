export const parseDateToLocal = (dateString: string | number | Date | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const parseDate = (dateString: string | number | Date | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const parseTime = (dateString: string | number | Date | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

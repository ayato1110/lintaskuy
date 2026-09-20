export function displaySKS(value: number): string {
  return `${value} SKS`;
}

export function formatPerformanceIndex(value: number): string {
  return value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function displaySemester(value: number): string {
  return `Semester ${value}`;
}
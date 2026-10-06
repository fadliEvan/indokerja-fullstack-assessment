/**
 * Formats integer salary to IDR format: "Rp 10.000.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats salary range with negotiation fallback
 */
export function formatSalary(
  salaryMin?: number | null,
  salaryMax?: number | null,
  isNegotiable?: boolean
): string {
  if (salaryMin && salaryMax) {
    return `${formatCurrency(salaryMin)} - ${formatCurrency(salaryMax)}`;
  }
  if (salaryMin) {
    return `Mulai dari ${formatCurrency(salaryMin)}`;
  }
  if (salaryMax) {
    return `Hingga ${formatCurrency(salaryMax)}`;
  }
  if (isNegotiable) {
    return 'Gaji Dinegosiasikan';
  }
  return 'Gaji Tidak Ditampilkan';
}

/**
 * Formats date into readable Indonesian date: "6 Oktober 2026"
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formats timestamp into full readable Indonesian date and time: "6 Okt 2026, 14:30 WIB"
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const formatted = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
    return `${formatted} WIB`;
  } catch {
    return dateString;
  }
}

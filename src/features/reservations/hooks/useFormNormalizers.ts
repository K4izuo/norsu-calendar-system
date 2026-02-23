export const normalizeTime = (time: string): string => {
  if (!time) return "00:00";
  const [hour, minute] = time.split(":");
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
};

export const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return "";

  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Extract date portion from ISO string or datetime string
  // This prevents timezone conversion issues
  const datePart = dateStr.split('T')[0].split(' ')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  // Fallback: parse as UTC to avoid timezone shifts
  const date = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(date.getTime())) return "";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

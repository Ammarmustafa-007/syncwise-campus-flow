// Format any date as Pakistan Standard Time (PST, UTC+5).
export function formatPKT(input: string | number | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = input instanceof Date ? input : new Date(input);
  return d.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

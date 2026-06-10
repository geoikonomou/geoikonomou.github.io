export function formatRatio(value, decimals = 2) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "N/A";
    return num.toFixed(decimals);
}

export function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = Math.max(bytes, 0);
  let i = 0;

  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }

  const decimals = n >= 100 ? 0 : n >= 10 ? 1 : 2;
  return n.toFixed(decimals) + " " + units[i];
}
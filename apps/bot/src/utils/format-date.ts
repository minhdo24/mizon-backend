export function formatDayMonth(time: string): string {
  const day = time.split("").slice(0, 2).join("");
  const month = time.split("").slice(3, 5).join("");
  const year = time.split("").slice(6, 10).join("");
  return `${month}/${day}/${year}`;
}

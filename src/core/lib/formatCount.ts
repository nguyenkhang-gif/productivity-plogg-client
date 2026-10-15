/** Rút gọn số đếm hiển thị trên UI: 1200 -> "1.2K". Dùng chung cho mọi counter
 * trong footer post (upvote, view) để không lệch định dạng trên cùng một hàng. */
export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

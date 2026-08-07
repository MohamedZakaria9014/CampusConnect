/**
 * Format timestamp into relative human-readable string (e.g. "2m ago", "3h ago", "2d ago")
 */
export function timeAgo(dateString?: string): string {
  if (!dateString) return '';
  const now = new Date().getTime();
  const past = new Date(dateString).getTime();
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format numbers into compact strings (e.g. 1.2k, 15k)
 */
export function formatCount(count?: number): string {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

/**
 * Format GPA representation
 */
export function formatGPA(gpa?: number): string {
  if (gpa === undefined || gpa === null) return 'N/A';
  return gpa.toFixed(2);
}

/**
 * Bắt số năm kinh nghiệm (VI + EN)
 * Ví dụ:
 * - "3 years"
 * - "2.5 năm"
 */
export function extractTotalExperience(text) {
  const regex = /(\d+(\.\d+)?)\s*(years?|năm)/gi;
  let max = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const value = parseFloat(match[1]);
    if (value > max) max = value;
  }

  return max;
}

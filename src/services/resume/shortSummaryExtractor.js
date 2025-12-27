export function extractShortSummary(summary) {
  if (!summary) return '';

  // tách câu
  const sentences = summary
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);

  if (sentences.length === 0) return summary.slice(0, 150);

  let best = sentences[0];

  // nếu câu đầu quá dài → cắt gọn
  if (best.length > 160) {
    best = best.slice(0, 157) + '...';
  }

  return best;
}
export function makeShortSummary(summary) {
  const sentence = summary
    .split('.')
    .find((s) => s.toLowerCase().includes('engineer'));

  return sentence ? sentence.trim() + '.' : summary.split('.')[0] + '.';
}

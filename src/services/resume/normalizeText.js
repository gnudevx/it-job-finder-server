export function normalizeText(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '\n')
    .replace(/[•●▪]/g, '-')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

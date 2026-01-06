import { franc } from 'franc';

export function detectLanguage(text) {
  const lang = franc(text || '');

  if (lang === 'vie') return 'vi';
  if (lang === 'eng') return 'en';

  return 'vi';
}

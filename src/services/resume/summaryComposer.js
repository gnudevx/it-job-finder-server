import { SUMMARY_TEMPLATES } from './summaryTemplates.js';

export function composeSummary(facts, level = 'Intern/Junior') {
  const lang = facts.language === 'en' ? 'en' : 'vi'; // fallback vi

  const tpl = SUMMARY_TEMPLATES[lang]?.default || SUMMARY_TEMPLATES.vi.default;

  return tpl
    .replace('{role}', facts.role?.label || facts.role || 'Software Engineer')
    .replace('{domains}', facts.domains?.join(', ') || '')
    .replace('{stacks}', facts.stacks?.slice(0, 5).join(', ') || '')
    .replace('{level}', level);
}

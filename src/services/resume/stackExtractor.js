const STACK_KEYWORDS = [
  'react',
  'node.js',
  'spring boot',
  'mongodb',
  'sql server',
  'python',
  'spark',
  'hadoop',
  'docker',
  'git',
];

export function extractStacksGeneric(text) {
  return STACK_KEYWORDS.filter((s) => text.includes(s));
}

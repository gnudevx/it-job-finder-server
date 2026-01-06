const ROLES = [
  'data engineer',
  'data analyst',
  'backend developer',
  'frontend developer',
  'fullstack developer',
  'software engineer',
];

export function detectRole(text) {
  const lower = text.toLowerCase();

  for (const role of ROLES) {
    if (lower.includes(role)) {
      return role;
    }
  }

  return '';
}

export function extractFacts(text) {
  const lower = text.toLowerCase();

  const facts = {
    role: '',
    years: '',
    stacks: [],
    domains: [],
  };

  // ROLE
  if (lower.includes('data engineer')) facts.role = 'Data Engineer';
  else if (lower.includes('fullstack')) facts.role = 'Full-stack Developer';
  else if (lower.includes('frontend')) facts.role = 'Frontend Developer';

  // YEARS (rất đơn giản)
  const yearMatch = text.match(/(\d+)\s*năm|\d+\s*years/i);
  if (yearMatch) facts.years = yearMatch[0];

  // TECH STACK
  const STACKS = [
    'spark',
    'hadoop',
    'hive',
    'airflow',
    'react',
    'node.js',
    'spring boot',
    'sql server',
    'mongodb',
    'power bi',
  ];

  facts.stacks = STACKS.filter((s) => lower.includes(s)).map((s) =>
    s.toUpperCase(),
  );

  // DOMAIN
  if (lower.includes('data lake')) facts.domains.push('Data Lake');
  if (lower.includes('data warehouse')) facts.domains.push('Data Warehouse');
  if (lower.includes('big data')) facts.domains.push('Big Data');

  return facts;
}

const STACK_KEYWORDS = [
  // Frontend
  'react',
  'vue',
  'angular',
  'next.js',
  'html',
  'css',
  'javascript',
  'typescript',

  // Backend
  'node.js',
  'express',
  'nestjs',
  'spring boot',
  'django',
  'flask',
  'laravel',

  // Database
  'mysql',
  'postgresql',
  'sql server',
  'oracle',
  'mongodb',
  'redis',

  // Data / Big Data
  'python',
  'spark',
  'hadoop',
  'hive',
  'airflow',
  'kafka',

  // DevOps
  'docker',
  'kubernetes',
  'ci/cd',
  'git',

  // BI / Visualization
  'power bi',
  'tableau',
  'matplotlib',
  'seaborn',
];

export function extractStacksGeneric(text) {
  const found = new Set();

  for (const stack of STACK_KEYWORDS) {
    if (text.includes(stack)) {
      found.add(
        stack.replace('.js', '.js').replace(/\b\w/g, (c) => c.toUpperCase()),
      );
    }
  }

  return Array.from(found);
}

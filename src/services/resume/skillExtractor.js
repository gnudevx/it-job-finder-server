const SKILL_DICTIONARY = [
  // Programming Languages
  { key: 'python', aliases: ['python'], category: 'language' },
  { key: 'java', aliases: ['java'], category: 'language' },
  { key: 'javascript', aliases: ['javascript', 'js'], category: 'language' },
  { key: 'typescript', aliases: ['typescript', 'ts'], category: 'language' },
  { key: 'c#', aliases: ['c#', 'csharp', 'c sharp'], category: 'language' },
  { key: 'c++', aliases: ['c++', 'cpp'], category: 'language' },
  { key: 'go', aliases: ['golang', 'go lang'], category: 'language' },
  { key: 'rust', aliases: ['rust'], category: 'language' },
  { key: 'php', aliases: ['php'], category: 'language' },
  { key: 'ruby', aliases: ['ruby'], category: 'language' },
  { key: 'kotlin', aliases: ['kotlin'], category: 'language' },
  { key: 'swift', aliases: ['swift'], category: 'language' },

  // Frontend
  {
    key: 'react',
    aliases: ['react', 'reactjs', 'react.js'],
    category: 'frontend',
  },
  { key: 'vue', aliases: ['vue', 'vuejs', 'vue.js'], category: 'frontend' },
  { key: 'angular', aliases: ['angular', 'angularjs'], category: 'frontend' },
  { key: 'html', aliases: ['html', 'html5'], category: 'frontend' },
  { key: 'css', aliases: ['css', 'css3'], category: 'frontend' },
  { key: 'sass', aliases: ['sass', 'scss'], category: 'frontend' },
  { key: 'webpack', aliases: ['webpack'], category: 'frontend' },
  {
    key: 'next.js',
    aliases: ['next.js', 'nextjs', 'next'],
    category: 'frontend',
  },
  {
    key: 'tailwind',
    aliases: ['tailwind', 'tailwindcss'],
    category: 'frontend',
  },
  { key: 'bootstrap', aliases: ['bootstrap'], category: 'frontend' },

  // Backend
  {
    key: 'spring boot',
    aliases: ['spring boot', 'springboot', 'spring'],
    category: 'backend',
  },
  {
    key: 'node.js',
    aliases: ['node.js', 'nodejs', 'node'],
    category: 'backend',
  },
  { key: 'express', aliases: ['express', 'expressjs'], category: 'backend' },
  { key: 'django', aliases: ['django'], category: 'backend' },
  { key: 'flask', aliases: ['flask'], category: 'backend' },
  { key: 'fastapi', aliases: ['fastapi', 'fast api'], category: 'backend' },
  { key: '.net', aliases: ['.net', 'dot net', 'asp.net'], category: 'backend' },
  { key: 'laravel', aliases: ['laravel'], category: 'backend' },

  // Database
  {
    key: 'sql server',
    aliases: ['sql server', 'mssql', 'ms sql'],
    category: 'database',
  },
  { key: 'mysql', aliases: ['mysql'], category: 'database' },
  {
    key: 'postgresql',
    aliases: ['postgresql', 'postgres'],
    category: 'database',
  },
  { key: 'oracle', aliases: ['oracle'], category: 'database' },
  { key: 'mongodb', aliases: ['mongodb', 'mongo'], category: 'database' },
  { key: 'redis', aliases: ['redis'], category: 'database' },
  {
    key: 'elasticsearch',
    aliases: ['elasticsearch', 'elastic search'],
    category: 'database',
  },
  { key: 'firebase', aliases: ['firebase'], category: 'database' },

  // Data & BI
  { key: 'ssis', aliases: ['ssis'], category: 'data' },
  { key: 'ssas', aliases: ['ssas'], category: 'data' },
  { key: 'power bi', aliases: ['power bi', 'powerbi'], category: 'data' },
  { key: 'tableau', aliases: ['tableau'], category: 'data' },
  { key: 'hadoop', aliases: ['hadoop'], category: 'data' },
  { key: 'hive', aliases: ['hive'], category: 'data' },
  { key: 'spark', aliases: ['spark', 'apache spark'], category: 'data' },
  { key: 'airflow', aliases: ['airflow', 'apache airflow'], category: 'data' },

  // DevOps & Tools
  { key: 'docker', aliases: ['docker'], category: 'devops' },
  { key: 'kubernetes', aliases: ['kubernetes', 'k8s'], category: 'devops' },
  { key: 'jenkins', aliases: ['jenkins'], category: 'devops' },
  { key: 'git', aliases: ['git', 'github', 'gitlab'], category: 'devops' },
  { key: 'aws', aliases: ['aws', 'amazon web services'], category: 'devops' },
  { key: 'azure', aliases: ['azure', 'microsoft azure'], category: 'devops' },
  {
    key: 'gcp',
    aliases: ['gcp', 'google cloud', 'google cloud platform'],
    category: 'devops',
  },
  { key: 'terraform', aliases: ['terraform'], category: 'devops' },

  // AI/ML
  {
    key: 'machine learning',
    aliases: ['machine learning', 'ml'],
    category: 'ai',
  },
  { key: 'deep learning', aliases: ['deep learning', 'dl'], category: 'ai' },
  { key: 'tensorflow', aliases: ['tensorflow'], category: 'ai' },
  { key: 'pytorch', aliases: ['pytorch', 'torch'], category: 'ai' },
  { key: 'scikit-learn', aliases: ['scikit-learn', 'sklearn'], category: 'ai' },
  {
    key: 'nlp',
    aliases: ['nlp', 'natural language processing'],
    category: 'ai',
  },
  {
    key: 'computer vision',
    aliases: ['computer vision', 'cv'],
    category: 'ai',
  },

  // Other
  {
    key: 'rest api',
    aliases: ['rest api', 'restful api', 'rest'],
    category: 'other',
  },
  { key: 'graphql', aliases: ['graphql', 'graph ql'], category: 'other' },
  {
    key: 'microservices',
    aliases: ['microservices', 'micro services'],
    category: 'other',
  },
  { key: 'agile', aliases: ['agile', 'scrum', 'kanban'], category: 'other' },
  { key: 'jira', aliases: ['jira'], category: 'other' },
  { key: 'junit', aliases: ['junit', 'unit testing'], category: 'other' },
];

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractSkills(text) {
  const lower = text.toLowerCase();
  const result = new Set();

  for (const skill of SKILL_DICTIONARY) {
    for (const alias of skill.aliases) {
      // Use word boundary regex to avoid false matches (e.g., "java" should not match "javascript")
      const escapedAlias = escapeRegExp(alias);
      const regex = new RegExp(`\\b${escapedAlias}\\b`, 'gi');
      if (regex.test(lower)) {
        result.add(skill.key);
        break;
      }
    }
  }

  return Array.from(result);
}

export function extractSkillsWithCategories(text) {
  const lower = text.toLowerCase();
  const result = new Map(); // skill => category

  for (const skill of SKILL_DICTIONARY) {
    for (const alias of skill.aliases) {
      const escapedAlias = escapeRegExp(alias);
      const regex = new RegExp(`\\b${escapedAlias}\\b`, 'gi');
      if (regex.test(lower)) {
        result.set(skill.key, skill.category);
        break;
      }
    }
  }

  return result;
}

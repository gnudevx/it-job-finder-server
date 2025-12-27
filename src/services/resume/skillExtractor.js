const SKILL_DICTIONARY = [
  { key: 'python', aliases: ['python'] },
  { key: 'java', aliases: ['java'] },
  { key: 'react', aliases: ['react', 'reactjs'] },
  { key: 'spring boot', aliases: ['spring boot', 'springboot'] },

  { key: 'sql server', aliases: ['sql server'] },
  { key: 'oracle', aliases: ['oracle'] },
  { key: 'mongodb', aliases: ['mongodb', 'mongo'] },

  { key: 'ssis', aliases: ['ssis'] },
  { key: 'ssas', aliases: ['ssas'] },
  { key: 'power bi', aliases: ['power bi'] },

  { key: 'hadoop', aliases: ['hadoop'] },
  { key: 'hive', aliases: ['hive'] },
  { key: 'spark', aliases: ['spark'] },
  { key: 'airflow', aliases: ['airflow'] },

  { key: 'docker', aliases: ['docker'] },
  { key: 'git', aliases: ['git', 'github'] },

  { key: 'machine learning', aliases: ['machine learning', 'ml'] },
];

export function extractSkills(text) {
  const lower = text.toLowerCase();
  const result = new Set();

  for (const skill of SKILL_DICTIONARY) {
    for (const alias of skill.aliases) {
      if (lower.includes(alias)) {
        result.add(skill.key);
        break;
      }
    }
  }

  return Array.from(result);
}

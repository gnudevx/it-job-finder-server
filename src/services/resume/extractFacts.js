import { ROLE_PROFILES } from './roleProfiles.js';
import { DOMAIN_PROFILES } from './domainProfiles.js';
import { detectLanguage } from './languageDetector.js';
import { extractStacksGeneric } from './stackExtractor.js';
export function extractFacts(text) {
  const lower = text.toLowerCase();

  const facts = {
    role: null,
    domains: [],
    stacks: [],
    language: detectLanguage(lower),
  };

  // ROLE scoring
  let bestRole = null;
  let bestScore = 0;

  for (const role of ROLE_PROFILES) {
    const score = role.keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestRole = role;
    }
  }

  facts.role = bestRole;

  // DOMAIN
  for (const [, domain] of Object.entries(DOMAIN_PROFILES)) {
    if (domain.keywords.some((k) => lower.includes(k))) {
      facts.domains.push(domain.label);
    }
  }

  // STACK (generic, không phụ thuộc ngành)
  facts.stacks = extractStacksGeneric(lower);

  return facts;
}

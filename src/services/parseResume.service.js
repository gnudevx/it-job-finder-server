import Resume from '../models/resumes.model.js';
import ParsedResume from '../models/ParsedResumeSchema.module.js';

import { parsePdf } from './resume/pdfParser.js';
import { parseDocx } from './resume/docxParser.js';
import { detectLanguage } from './resume/languageDetector.js';
import { extractSkills } from './resume/skillExtractor.js';
import { extractTotalExperience } from './experienceExtractor.js';
import { detectRole } from './resume/roleDetector.js';
import { resolveUploadPath } from '../utils/resolveUploadPath.js';
import { normalizeText } from './resume/normalizeText.js';
import { extractFacts } from './resume/extractFacts.js';
import { composeSummary } from './resume/summaryComposer.js';
import { makeShortSummary } from './resume/shortSummaryExtractor.js';
import { triggerEmbedCV } from './ai/embedTrigger.js';
/**
 * Parse resume based on file type
 */
async function parseResumeByType(filePath, fileType) {
  let rawText = '';

  if (fileType === 'docx' || fileType === 'doc') {
    rawText = await parseDocx(filePath);
  } else {
    // Default to PDF parser
    rawText = await parsePdf(filePath);
  }

  return normalizeText(rawText);
}

/**
 * PARSE RESUME – CHỈ 1 LẦN
 */
export async function parseAndSaveResume(resumeId) {
  // 1️⃣ Nếu đã parse → bỏ qua
  const exists = await ParsedResume.findOne({ resumeId });
  if (exists) return exists;

  // 2️⃣ Load resume
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new Error('Resume not found');

  // 3️⃣ Parse based on file type
  const filePath = resolveUploadPath(resume.fileUrl);
  const rawText = await parseResumeByType(filePath, resume.fileType);

  // 4️⃣ Extract
  const language = detectLanguage(rawText);
  const skills = extractSkills(rawText);
  const totalYearsExperience = extractTotalExperience(rawText);
  const detectedRole = detectRole(rawText);
  const facts = extractFacts(rawText);
  const summary = composeSummary(facts);
  const shortSummary = makeShortSummary({
    rawText,
    detectedRole,
    skills,
    totalYearsExperience,
    summary,
    language,
  });

  // 5️⃣ Save
  const parsed = await ParsedResume.create({
    resumeId,
    candidateId: resume.candidateId,
    rawText,
    language,
    skills,
    totalYearsExperience,
    detectedRole,
    summary,
    shortSummary,
  });
  // 6. Trigger Python embed — fire & forget, không await
  // Không block response về cho user, Python tự xử lý nền
  triggerEmbedCV(resumeId.toString()).catch((err) =>
    console.error(
      `[EmbedTrigger] Failed for resumeId ${resumeId}:`,
      err.message,
    ),
  );
  return parsed;
}

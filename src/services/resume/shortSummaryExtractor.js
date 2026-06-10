/**
 * shortSummaryExtractor.js
 *
 * Tạo "dense summary" từ CV — giữ đủ signal để embedding matching tốt.
 * Format: "[Tên] | [Role] | [X năm KN] | Skills: ... | Học vấn: ... | Tóm tắt: ..."
 *
 * Lý do dùng format này thay vì lấy 1 câu:
 *   - Embedding model học từ semantic — càng nhiều context càng tốt
 *   - Structured text giúp model phân biệt role vs skill vs experience rõ hơn
 *   - Tối đa ~400 token — vừa đủ cho text-embedding-004 (input limit 2048 token)
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Trích xuất tên ứng viên từ rawText.
 * Heuristic: dòng đầu tiên không phải email/phone/url thường là tên.
 */
function extractName(rawText = '') {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && l.length < 60);

  for (const line of lines.slice(0, 5)) {
    const isEmail = /@/.test(line);
    const isPhone = /\d{8,}/.test(line);
    const isUrl = /https?:|linkedin|github/i.test(line);
    const isHeader = /curriculum vitae|resume|cv\b/i.test(line);
    if (!isEmail && !isPhone && !isUrl && !isHeader) {
      return line;
    }
  }
  return '';
}

/**
 * Trích xuất học vấn — tìm dòng có keyword trường/bằng.
 */
function extractEducation(rawText = '') {
  const eduKeywords =
    /đại học|university|bachelor|master|engineer|cao đẳng|học viện|institute|college/i;
  const lines = rawText.split('\n').map((l) => l.trim());

  for (const line of lines) {
    if (eduKeywords.test(line) && line.length > 10 && line.length < 120) {
      return line;
    }
  }
  return '';
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Tạo dense summary từ các facts đã extract.
 *
 * @param {object} params
 * @param {string} params.rawText
 * @param {string} params.detectedRole
 * @param {string[]} params.skills
 * @param {number} params.totalYearsExperience
 * @param {string} params.summary          - long summary từ composeSummary()
 * @param {string} [params.language]
 * @returns {string}
 */
export function makeShortSummary({
  rawText = '',
  detectedRole = '',
  skills = [],
  totalYearsExperience = 0,
  summary = '',
}) {
  const parts = [];

  // 1. Tên ứng viên
  const name = extractName(rawText);
  if (name) parts.push(name);

  // 2. Role + kinh nghiệm
  const role = detectedRole || 'Developer';
  const exp =
    totalYearsExperience > 0 ? `${totalYearsExperience} năm kinh nghiệm` : '';
  parts.push([role, exp].filter(Boolean).join(', '));

  // 3. Top skills — lấy tối đa 12, quan trọng nhất
  if (skills.length > 0) {
    parts.push(`Kỹ năng: ${skills.slice(0, 12).join(', ')}`);
  }

  // 4. Học vấn
  const edu = extractEducation(rawText);
  if (edu) parts.push(`Học vấn: ${edu}`);

  // 5. Summary ngắn — lấy 2 câu đầu có nghĩa (> 20 chars)
  if (summary) {
    const sentences = summary
      .split(/[.!?\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    const top2 = sentences.slice(0, 2).join('. ');
    if (top2) parts.push(top2);
  }

  const result = parts.join(' | ');

  // Giới hạn ~400 token ≈ 1600 ký tự — vừa đủ cho text-embedding-004
  return result.length > 1600 ? result.slice(0, 1597) + '...' : result;
}

/**
 * @deprecated Dùng makeShortSummary({ rawText, detectedRole, ... }) thay thế.
 * Giữ lại để không break code cũ trong quá trình migration.
 */
export function extractShortSummary(summary) {
  if (!summary) return '';
  const sentences = summary
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);
  if (sentences.length === 0) return summary.slice(0, 150);
  const best = sentences[0];
  return best.length > 160 ? best.slice(0, 157) + '...' : best;
}

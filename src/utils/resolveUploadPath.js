import path from 'path';

export function resolveUploadPath(fileUrl) {
  // bỏ dấu "/" đầu
  const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;

  return path.join(process.cwd(), relativePath);
}

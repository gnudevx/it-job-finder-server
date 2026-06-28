import fs from 'fs';
import os from 'os';
import path from 'path';

export async function resolveUploadPath(fileUrl, fileName = '') {
  if (!fileUrl) {
    throw new Error('File URL is required');
  }

  if (!/^https?:\/\//i.test(fileUrl)) {
    const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    return {
      filePath: path.join(process.cwd(), relativePath),
      isTemporary: false,
    };
  }

  const extension = path.extname(fileName || fileUrl).toLowerCase() || '.pdf';
  const tempFilePath = path.join(
    os.tmpdir(),
    `${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`,
  );

  const response = await fetch(fileUrl);
  if (!response?.ok) {
    throw new Error(`Failed to download file from ${fileUrl}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.promises.writeFile(tempFilePath, Buffer.from(arrayBuffer));

  return {
    filePath: tempFilePath,
    isTemporary: true,
  };
}

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

async function traverseDir(dir) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await traverseDir(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg'))) {
      const ext = path.extname(fullPath);
      const newPath = fullPath.slice(0, -ext.length) + '.webp';
      console.log(`Converting ${fullPath} to ${newPath}`);
      try {
        await sharp(fullPath).webp({ quality: 80 }).toFile(newPath);
        await fs.unlink(fullPath);
      } catch (err) {
        console.error(`Failed to convert ${fullPath}:`, err);
      }
    }
  }
}

traverseDir('./public/img').then(() => console.log('Done.')).catch(console.error);

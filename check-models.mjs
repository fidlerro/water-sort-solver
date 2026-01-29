import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicModelsDir = path.join(__dirname, '../public/models');

console.log('Checking for model files in:', publicModelsDir);
console.log('Contents:');

try {
  const files = fs.readdirSync(publicModelsDir);
  files.forEach(file => {
    const filePath = path.join(publicModelsDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  - ${file} (${sizeMB} MB)`);
  });
} catch(error) {
  console.error('Error:', error.message);
}

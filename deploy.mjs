import FtpDeploy from 'ftp-deploy';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read FTP configuration
const config = JSON.parse(
  readFileSync(join(__dirname, '.ftp-deploy.json'), 'utf-8')
);

const ftpDeploy = new FtpDeploy();

console.log('🚀 Starting deployment to GoDaddy...\n');

ftpDeploy
  .deploy(config)
  .then(() => {
    console.log('\n✅ Deployment completed successfully!');
  })
  .catch((err) => {
    console.error('\n❌ Deployment failed:', err);
    process.exit(1);
  });

// Progress events
ftpDeploy.on('uploading', (data) => {
  console.log(`📤 Uploading: ${data.filename} (${data.transferredFileCount}/${data.totalFilesCount})`);
});

ftpDeploy.on('uploaded', (data) => {
  console.log(`✓ Uploaded: ${data.filename}`);
});

ftpDeploy.on('log', (data) => {
  console.log(`ℹ️  ${data}`);
});

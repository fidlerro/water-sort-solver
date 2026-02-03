# Deploying to GoDaddy

This project includes an automated FTP deployment script to deploy your application to GoDaddy hosting.

## Setup (One-Time)

1. **Get your GoDaddy FTP credentials:**
   - Log into your GoDaddy account
   - Go to your hosting control panel (cPanel or Plesk)
   - Find the FTP accounts section
   - Note down:
     - FTP Host (usually `ftp.yourdomain.com`)
     - FTP Username (usually `username@yourdomain.com`)
     - FTP Password
     - Remote directory path (usually `/` or `/httpdocs` or `/public_html`)

2. **Configure the deployment:**
   - Open `.ftp-deploy.json` in the root directory
   - Update the following fields with your GoDaddy credentials:
     ```json
     {
       "host": "ftp.yourdomain.com",
       "user": "username@yourdomain.com",
       "password": "your-password",
       "remoteRoot": "/"
     }
     ```
   - **IMPORTANT:** Never commit `.ftp-deploy.json` to git (it's already in `.gitignore`)

## Deploying

Once configured, deploy your application with a single command:

```bash
npm run deploy
```

This command will:
1. Build your application (`npm run build`)
2. Upload all files from the `dist` folder to your GoDaddy server via FTP
3. Show progress for each file uploaded

## Deployment Configuration

You can customize the deployment in `.ftp-deploy.json`:

- **localRoot**: The local folder to upload (default: `./dist`)
- **remoteRoot**: The remote folder on the server (default: `/`)
- **include**: File patterns to include (default: all files)
- **exclude**: File patterns to exclude (default: node_modules, .git)
- **deleteRemote**: Whether to delete files on server not in local (default: `false`)

## IIS Configuration

Your `web.config` file in the `public` folder is automatically included in the build and will be deployed to configure IIS properly for your React application.

## Troubleshooting

- **Connection timeout:** Check your FTP host and port (should be 21)
- **Authentication failed:** Verify your username and password
- **Files not showing up:** Check the `remoteRoot` path matches your GoDaddy hosting structure
- **403 Forbidden:** Ensure your GoDaddy hosting plan supports custom applications and URL rewriting

## Security Notes

- Never share your `.ftp-deploy.json` file
- Use a strong FTP password
- Consider using FTPS if your GoDaddy hosting supports it (change `"sftp": false` to `"sftp": true` and use port 22)

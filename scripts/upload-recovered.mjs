import SftpClient from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function uploadImages() {
    const sftp = new SftpClient();

    try {
        console.log('[UPLOAD] Connecting to SFTP server...');
        await sftp.connect({
            host: process.env.SFTP_HOST,
            username: process.env.SFTP_USER,
            privateKey: fs.readFileSync(process.env.SFTP_PRIVATE_KEY_PATH),
            passphrase: process.env.SFTP_PASSPHRASE
        });
        
        console.log('[UPLOAD] Connected successfully!');

        const localDir = path.resolve(process.cwd(), 'public', 'assets', 'images', 'recovered');
        // The root directory on the CDN server where images are hosted
        const remoteDir = '/var/www/images.zenithfcm.com';

        const files = fs.readdirSync(localDir);
        for (const file of files) {
            const localPath = path.join(localDir, file);
            const remotePath = `${remoteDir}/${file}`;
            
            console.log(`Uploading ${file}...`);
            await sftp.fastPut(localPath, remotePath);
            console.log(`Successfully uploaded to ${remotePath}`);
        }

        console.log('[UPLOAD] All files uploaded successfully! You can verify them on the CDN now.');
    } catch (err) {
        console.error('[UPLOAD ERROR]', err.message);
    } finally {
        await sftp.end();
    }
}

uploadImages();

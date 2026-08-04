import fs from 'fs';
import path from 'path';
import SftpClient from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const RECOVERED_DIR = path.resolve(process.cwd(), 'recovered');
const REMOTE_DIR = '/var/www/images.zenithfcm.com';
const CONCURRENCY = 2; // Safe upload concurrency

async function startUploader() {
    console.log('[UPLOADER] Initializing SFTP Mass Uploader...');

    if (!fs.existsSync(RECOVERED_DIR)) {
        console.error('No recovered directory found!');
        return;
    }

    const files = fs.readdirSync(RECOVERED_DIR).filter(file => file.endsWith('.png'));
    if (files.length === 0) {
        console.log('No images to upload in the recovered folder.');
        return;
    }
    console.log(`[UPLOADER] Found ${files.length} images ready to upload.`);

    const sftp = new SftpClient();
    try {
        console.log('[SFTP] Connecting to CDN...');
        await sftp.connect({
            host: process.env.SFTP_HOST,
            username: process.env.SFTP_USER,
            privateKey: fs.readFileSync(process.env.SFTP_PRIVATE_KEY_PATH),
            passphrase: process.env.SFTP_PASSPHRASE
        });
        console.log('[SFTP] Connected successfully.');
    } catch (err) {
        console.error('[SFTP ERROR]', err.message);
        return;
    }

    const limit = pLimit(CONCURRENCY);
    let uploadedCount = 0;
    let errorCount = 0;
    const total = files.length;

    const tasks = files.map(filename => limit(async () => {
        const localPath = path.join(RECOVERED_DIR, filename);
        const remotePath = `${REMOTE_DIR}/${filename}`;
        
        try {
            await sftp.fastPut(localPath, remotePath);
            uploadedCount++;
            if (uploadedCount % 100 === 0 || uploadedCount === total) {
                 console.log(`[${uploadedCount}/${total}] Uploaded ${filename}...`);
            }
        } catch (err) {
            errorCount++;
            console.error(`[ERROR] Failed to upload ${filename}: ${err.message}`);
        }
    }));

    await Promise.all(tasks);
    await sftp.end();
    
    console.log(`\n[UPLOADER] Finished!`);
    console.log(`Successfully uploaded: ${uploadedCount}`);
    console.log(`Failed: ${errorCount}`);
}

startUploader().catch(console.error);

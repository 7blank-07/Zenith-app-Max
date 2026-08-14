import { NextResponse } from 'next/server';
import SftpClient from 'ssh2-sftp-client';
import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';

export const maxDuration = 60; // Max execution time

export async function POST(request) {
  try {
    // 1. Authenticate user
    await requireBlogSessionUser({ nextPath: null });

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const filename = formData.get('filename');

    if (!file || !filename) {
      return NextResponse.json({ error: 'File and filename are required' }, { status: 400 });
    }

    // 3. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Initialize SFTP
    const sftp = new SftpClient();
    
    // Support either private key file path or no key
    const privateKeyPath = process.env.SFTP_PRIVATE_KEY_PATH;
    let privateKey = undefined;
    if (privateKeyPath) {
       privateKey = require('fs').readFileSync(privateKeyPath);
    }

    await sftp.connect({
      host: process.env.SFTP_HOST,
      username: process.env.SFTP_USER,
      privateKey: privateKey,
      passphrase: process.env.SFTP_PASSPHRASE
    });

    const remoteDir = '/var/www/images.zenithfcm.com';
    const remotePath = `${remoteDir}/${filename}`;

    // 5. Upload via SFTP stream/buffer
    await sftp.put(buffer, remotePath);
    await sftp.end();

    // 6. Return the public CDN url
    const publicUrl = `https://images.zenithfcm.com/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('[admin-upload-api] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

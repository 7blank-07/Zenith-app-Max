import { NextResponse } from 'next/server';
import Client from 'ssh2-sftp-client';
import { getBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';

// We disable body parser for Next.js 14 API routes receiving FormData by default, but it's not needed for app router 'route.js'
export const maxDuration = 60; // Set max duration for file uploads if deployed on Vercel

export async function POST(request) {
  try {
    // 1. Authenticate user
    const sessionUser = await getBlogSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('image');
    const customName = formData.get('filename');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // 3. Prepare the file buffer and name
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Use custom name or original name, ensuring it's sanitized
    let finalFileName = customName ? customName.trim() : file.name;
    // Basic sanitization
    finalFileName = finalFileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    // Ensure it has an extension if it didn't have one
    if (!finalFileName.includes('.')) {
       const ext = file.name.split('.').pop() || 'png';
       finalFileName = `${finalFileName}.${ext}`;
    }

    // 4. SSH/SFTP Connection details
    const host = process.env.SFTP_HOST || '157.230.249.27';
    const username = process.env.SFTP_USER || 'blank';
    const password = process.env.SFTP_PASSWORD;
    let privateKey = process.env.SFTP_PRIVATE_KEY;
    const privateKeyPath = process.env.SFTP_PRIVATE_KEY_PATH;
    const remoteDir = '/var/www/images.zenithfcm.com';

    // If a path to the private key is provided, read it directly from the file system
    if (privateKeyPath) {
      const fs = require('fs');
      try {
        privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      } catch (err) {
        console.warn(`Could not read private key from path: ${privateKeyPath}`, err);
      }
    }

    if (!password && !privateKey) {
       console.warn("No SFTP_PASSWORD or SFTP_PRIVATE_KEY provided in env variables.");
       // For local dev without env variables, return a mocked success or real error
       // We'll return an error requiring the env vars
       return NextResponse.json({ 
         error: 'SFTP credentials not configured. Please add SFTP_PASSWORD, SFTP_PRIVATE_KEY, or SFTP_PRIVATE_KEY_PATH to .env.local' 
       }, { status: 500 });
    }

    const sftp = new Client();
    
    const connectConfig = {
      host,
      username,
      port: 22,
    };

    if (process.env.SFTP_PASSPHRASE) {
      connectConfig.passphrase = process.env.SFTP_PASSPHRASE;
    }

    if (privateKey) {
      // Sometimes private keys in env vars have escaped newlines
      connectConfig.privateKey = privateKey.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey;
    } else {
      connectConfig.password = password;
    }

    // 5. Connect and Upload
    await sftp.connect(connectConfig);
    
    const remotePath = `${remoteDir}/${finalFileName}`;
    
    await sftp.put(buffer, remotePath);
    await sftp.end();

    // 6. Return Success with the public URL
    const publicUrl = `https://images.zenithfcm.com/${finalFileName}`;
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: 'Image uploaded successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('SFTP Upload Error:', error);
    return NextResponse.json({ 
      error: `Upload Failed: ${error.message || 'Unknown error'}`, 
      details: error.message 
    }, { status: 500 });
  }
}

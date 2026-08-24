import { NextResponse } from 'next/server';
import { listPublishedBlogsByCategory, updateBlog } from '../../../../src/lib/server/blog/repository.mjs';
import { createRedeemCode } from '../../../../src/lib/server/redeem-codes/repository.mjs';
import { runBlogQuery } from '../../../../src/lib/server/blog/db.mjs';
import { REDEEM_CODE_SCOPE, REDEEM_CODE_STATUS } from '../../../../src/lib/server/redeem-codes/constants.mjs';
import { revalidatePath } from 'next/cache';
import { buildRedeemRevalidationPaths } from '../../../../src/lib/server/redeem-codes/revalidation.mjs';
import { revalidateAppPaths } from '../../../../src/lib/server/blog/revalidation.mjs';

// Simple key rotator
let currentKeyIndex = 0;
function getNextGeminiKey() {
    const keys = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3
    ].filter(Boolean);
    
    if (keys.length === 0) throw new Error("No Gemini API keys found in environment.");
    
    const key = keys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    return key;
}


async function processGeminiUpdatesInBackground(code, rewards, isExpired) {
    try {
        const blogsResult = await listPublishedBlogsByCategory('redeem-codes', { pageSize: 50 });
        const targetBlogs = blogsResult.items.filter(b => 
            b.slug !== 'how-to-redeem-codes-in-fc-mobile' && 
            b.slug !== 'code-fc-mobile-thang-vietnam'
        );
        
        let successCount = 0;
        let failCount = 0;
        
        for (const blog of targetBlogs) {
            try {
                console.log('[RedeemAutoUpdate] Updating blog: ' + blog.slug);
                let updatedHtml = null;
                
                let attempts = 0;
                while (attempts < 3) {
                    try {
                        const apiKey = getNextGeminiKey();
                        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=' + apiKey;
                        
                        let prompt = '';
                        
                        if (isExpired) {
                            prompt = `You are an expert content manager. 
The following FC Mobile Redeem Codes blog post HTML needs to be updated because the code ${code} has EXPIRED.

Instructions:
1. This is HTML code. You must output VALID HTML. Keep the exact same language and structure.
2. Find the code ${code} in the "Active Codes" table. Change its status to Expired (translate to the appropriate language).
3. Move the ${code} row from the "Active Codes" table into the "Expired Codes" table.
4. In any paragraphs, subtitles, or FAQ bullet points that list ${code} as an active code, remove it. 
5. If there is a section detailing the rewards for ${code} specifically, you may leave it but clarify in the text that it is now expired.
6. If there is a "Last Updated" date, update it to today's date, preserving the original language format.
7. Output ONLY the updated HTML. Do NOT wrap it in markdown backticks (no \`\`\`html). Just raw HTML.

Original HTML:
${blog.contentHtml}`;
                        } else {
                            prompt = `You are an expert content manager. 
Add a new active code to the following blog post HTML about FC Mobile Redeem Codes.
New Code: ${code}
Rewards: ${rewards}

Instructions:
1. This is HTML code. You must output VALID HTML. Keep the exact same language and structure.
2. IMPORTANT: This is the LATEST code, so it must ALWAYS appear FIRST (at the top) everywhere it is mentioned.
3. Find the "Active Codes" table/list and insert a new row for ${code} at the VERY TOP of the table (right under the header). Translate the status ("Active") to match the language.
4. Find the section where detailed breakdowns of each code are listed, and add a new breakdown block for ${code} BEFORE all the other active code breakdowns.
5. In any paragraphs, subtitles, or FAQ bullet points that list active codes, insert ${code} as the FIRST item in the list.
6. If there is a "Last Updated" date, update it to today's date, preserving the original language format.
7. Output ONLY the updated HTML. Do NOT wrap it in markdown backticks (no \`\`\`html). Just raw HTML.

Original HTML:
${blog.contentHtml}`;
                        }

                        const response = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: prompt }] }],
                                generationConfig: { temperature: 0.1 }
                            })
                        });
                        
                        if (!response.ok) {
                            const text = await response.text();
                            throw new Error('Gemini API error ' + response.status + ': ' + text);
                        }
                        const data = await response.json();
                        if (data.error) throw new Error(data.error.message);
                        
                        updatedHtml = data.candidates[0].content.parts[0].text.trim();
                        break; 
                        
                    } catch (err) {
                        attempts++;
                        console.log('[RedeemAutoUpdate] Gemini error on attempt ' + attempts + ' for ' + blog.slug + ': ' + err.message + '. Switching key...');
                        if (attempts >= 3) throw err; 
                        await new Promise(r => setTimeout(r, 2000)); 
                    }
                }
                
                if (updatedHtml.startsWith('```html')) updatedHtml = updatedHtml.replace(/^```html\n/, '');
                if (updatedHtml.startsWith('```')) updatedHtml = updatedHtml.replace(/^```\n/, '');
                if (updatedHtml.endsWith('```')) updatedHtml = updatedHtml.replace(/\n```$/, '');

                await updateBlog(blog.id, {
                    ...blog,
                    contentHtml: updatedHtml,
                    contentJson: null 
                });
                
                revalidatePath('/blogs/redeem-codes/' + blog.slug, 'page');
                
                successCount++;
                console.log('[RedeemAutoUpdate] Successfully updated:', blog.slug);
                
            } catch (err) {
                console.error('[RedeemAutoUpdate] Failed to update blog ' + blog?.slug + ':', err);
                failCount++;
            }
            
            await new Promise(r => setTimeout(r, 1000));
        }
        console.log('[RedeemAutoUpdate] Finished background update. Success: ' + successCount + ', Failed: ' + failCount);
    } catch (err) {
        console.error('[RedeemAutoUpdate] Fatal Error in background task:', err);
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        
        // 1. Verify Secret
        const expectedSecret = process.env.REDEEM_WEBHOOK_SECRET || 'ZenithRedeemSecret2026_Auto';
        if (body.secret !== expectedSecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { code, rewards } = body;
        if (!code || !rewards) {
            return NextResponse.json({ error: "Missing code or rewards" }, { status: 400 });
        }
        
        const isExpired = rewards.trim().toLowerCase() === "expired" || rewards.trim().toLowerCase() === "expire";
        
        console.log(`[RedeemAutoUpdate] Starting update for code: ${code}. Is Expired? ${isExpired}`);

        // 2. Add Code to Static Database (1 month expiry) if not already expired
        let savedCode = null;
        if (!isExpired) {
            const publishedAt = new Date();
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            
            try {
                savedCode = await createRedeemCode({
                    title: rewards,
                    codeValue: code,
                    scope: REDEEM_CODE_SCOPE.GLOBAL,
                    status: REDEEM_CODE_STATUS.ACTIVE,
                    publishedAt: publishedAt.toISOString(),
                    expiresAt: expiresAt.toISOString()
                });
                console.log(`[RedeemAutoUpdate] Added ${code} to global static codes.`);
            } catch (e) {
                console.error(`[RedeemAutoUpdate] Failed to add to static database (might already exist):`, e);
            }
        }
        
        // 3. Clear Static Pages Cache
        const paths = buildRedeemRevalidationPaths({ nextCode: savedCode, extraPaths: ['/fc-mobile-redeem-codes'] });
        await revalidateAppPaths(paths);
        
        // 4. Start Background Processing
        processGeminiUpdatesInBackground(code, rewards, isExpired);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Update accepted and processing in background for code: ' + code 
        });

    } catch (err) {
        console.error("[RedeemAutoUpdate] Fatal Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

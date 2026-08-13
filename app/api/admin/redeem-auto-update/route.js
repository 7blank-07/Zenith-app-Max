import { NextResponse } from 'next/server';
import { listPublishedBlogsByCategory, updateBlog } from '../../../../src/lib/server/blog/repository.mjs';
import { createRedeemCode } from '../../../../src/lib/server/redeem-codes/repository.mjs';
import { REDEEM_CODE_SCOPE, REDEEM_CODE_STATUS } from '../../../../src/lib/server/redeem-codes/constants.mjs';
import { revalidatePath } from 'next/cache';

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

export async function POST(req) {
    try {
        const body = await req.json();
        
        // 1. Verify Secret
        if (body.secret !== process.env.REDEEM_WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { code, rewards } = body;
        if (!code || !rewards) {
            return NextResponse.json({ error: "Missing code or rewards" }, { status: 400 });
        }
        
        console.log(`[RedeemAutoUpdate] Starting update for code: ${code}`);

        // 2. Add Code to Static Database (1 month expiry)
        const publishedAt = new Date();
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        
        try {
            await createRedeemCode({
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
        
        // 3. Clear Static Pages Cache
        revalidatePath('/fc-mobile-redeem-codes', 'page');
        
        // 4. Fetch the 11 Blogs
        const blogsResult = await listPublishedBlogsByCategory('redeem-codes', { pageSize: 50 });
        const targetBlogs = blogsResult.items.filter(b => b.slug !== 'how-to-redeem-codes-in-fc-mobile');
        
        let successCount = 0;
        let failCount = 0;
        
        // 5. Update Blogs via Gemini (Processing in sequence)
        for (const blog of targetBlogs) {
            try {
                console.log(`[RedeemAutoUpdate] Updating blog: ${blog.slug}`);
                const apiKey = getNextGeminiKey();
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                
                const prompt = `You are an expert content manager. 
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

                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.1 }
                    })
                });
                
                const data = await response.json();
                if (data.error) throw new Error(data.error.message);
                
                let updatedHtml = data.candidates[0].content.parts[0].text.trim();
                
                // Clean up any accidental markdown formatting from Gemini
                if (updatedHtml.startsWith('```html')) updatedHtml = updatedHtml.replace(/^```html\n/, '');
                if (updatedHtml.startsWith('```')) updatedHtml = updatedHtml.replace(/^```\n/, '');
                if (updatedHtml.endsWith('```')) updatedHtml = updatedHtml.replace(/\n```$/, '');

                // Update blog in DB. Note: we set contentJson to null so the admin editor parses the new HTML instead of loading stale JSON.
                await updateBlog(blog.id, {
                    ...blog,
                    contentHtml: updatedHtml,
                    contentJson: null 
                });
                
                // Clear cache for this blog
                revalidatePath(`/blogs/redeem-codes/${blog.slug}`, 'page');
                successCount++;
                console.log(`[RedeemAutoUpdate] Successfully updated: ${blog.slug}`);
                
            } catch (err) {
                console.error(`[RedeemAutoUpdate] Failed to update blog ${blog?.slug}:`, err);
                failCount++;
            }
        }
        
        return NextResponse.json({ 
            success: true, 
            message: `Updated static DB and ${successCount} blogs successfully. ${failCount} failed.` 
        });

    } catch (err) {
        console.error("[RedeemAutoUpdate] Fatal Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

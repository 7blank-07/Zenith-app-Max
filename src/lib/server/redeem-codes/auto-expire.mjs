import { listPublishedBlogsByCategory, updateBlog } from '../blog/repository.mjs';
import { revalidatePath } from 'next/cache';

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

export async function triggerAutoExpire(code) {
    console.log(`[AutoExpire] Starting background expiration for code: ${code}`);
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
                console.log(`[AutoExpire] Updating blog: ${blog.slug}`);
                let updatedHtml = null;
                
                // Retry loop to handle 503/429 errors
                let attempts = 0;
                while (attempts < 3) {
                    try {
                        const apiKey = getNextGeminiKey();
                        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
                        
                        const prompt = `You are an expert content manager. 
The FC Mobile Redeem Code "${code}" has just EXPIRED.
You must update the following HTML blog post to reflect this.

Instructions:
1. This is HTML code. You must output VALID HTML. Keep the exact same language and structure.
2. Find "${code}" in the "Active Codes" table/list and REMOVE its row entirely.
3. Find the "Recently Expired Codes" table/list and INSERT a new row for "${code}" at the TOP of the expired table. Translate the status ("Expired") to match the language. The third column should just describe the rewards briefly or say "N/A" if unknown.
4. If there is a detailed breakdown section for "${code}" (e.g. an <h2> or <h3> block specifically for this code), REMOVE that specific section entirely, because expired codes don't need detailed breakdowns.
5. In any FAQ or paragraphs that list the active codes, REMOVE "${code}".
6. In any FAQ or paragraphs that list the EXPIRED codes, ADD "${code}" to that list.
7. If there is a "Last Updated" date, update it to today's date, preserving the original language format.
8. Output ONLY the updated HTML. Do NOT wrap it in markdown backticks (no \`\`\`html). Just raw HTML.

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
                        
                        if (!response.ok) {
                            const text = await response.text();
                            throw new Error(`Gemini API error ${response.status}: ${text}`);
                        }
                        const data = await response.json();
                        if (data.error) throw new Error(data.error.message);
                        
                        updatedHtml = data.candidates[0].content.parts[0].text.trim();
                        break; // Success! Break out of the retry loop.
                        
                    } catch (err) {
                        attempts++;
                        console.log(`[AutoExpire] Gemini error on attempt ${attempts} for ${blog.slug}: ${err.message}.`);
                        if (attempts >= 3) {
                            throw err; // Out of retries
                        } else {
                            console.log(`[AutoExpire] Switching key and waiting 60s for quota to clear...`);
                            await new Promise(r => setTimeout(r, 60000));
                        }
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
                
                revalidatePath(`/blogs/redeem-codes/${blog.slug}`, 'page');
                successCount++;
                console.log(`[AutoExpire] Successfully updated: ${blog.slug}`);
                
            } catch (err) {
                console.error(`[AutoExpire] Failed to update blog ${blog?.slug}:`, err);
                failCount++;
            }
            
            // Pace requests to avoid 429 quota exhaustion on free tier
            console.log("[AutoExpire] Waiting 65 seconds for API quota to reset...");
            await new Promise(r => setTimeout(r, 65000));
        }
        
        console.log(`[AutoExpire] Finished! Success: ${successCount}, Failed: ${failCount}`);
    } catch (err) {
        console.error("[AutoExpire] Fatal Error:", err);
    }
}

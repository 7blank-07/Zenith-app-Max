I’ve applied for Google AdSense for my Next.js website (zenithfcm.com), and AdSense shows “ads.txt status: Not found.”

Task:
1. Add the required ads.txt support for AdSense in my Next.js project.
2. Create a public/ads.txt file so it is accessible at:
   https://zenithfcm.com/ads.txt
3. Insert this exact AdSense placeholder line (I will replace with my real publisher ID later):
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
4. Ensure this works correctly in production deployment.
5. Verify there are no routing conflicts or redirects blocking /ads.txt.
6. If robots.txt or middleware could interfere, fix that too.
7. Keep implementation clean, production-safe, and SEO-safe.

Also:
- Explain what files were added/changed
- Confirm final expected live URL
- Mention any deployment steps needed
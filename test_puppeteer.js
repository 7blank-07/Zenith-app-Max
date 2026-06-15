const puppeteer = require('puppeteer');
async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/player/eusebio-120-3114943', { waitUntil: 'networkidle0' });
  const html = await page.content();
  console.log(html.includes('Playstyles') ? 'FOUND PLAYSTYLES' : 'NOT FOUND PLAYSTYLES');
  console.log(html.includes('RAPID') || html.includes('Rapid') ? 'FOUND RAPID' : 'NOT FOUND RAPID');
  await browser.close();
}
run();

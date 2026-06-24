const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

async function run() {
  let executablePath = '';
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  if (!executablePath) {
    console.error('Could not find Chrome or Edge executable.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Wait for preloader
  await new Promise(r => setTimeout(r, 5000));

  const scrollPositions = [0, 200, 400, 600, 800];
  
  for (const pos of scrollPositions) {
    console.log(`Scrolling to ${pos}px...`);
    await page.evaluate((scrollPos) => window.scrollTo(0, scrollPos), pos);
    await new Promise(r => setTimeout(r, 800));

    const info = await page.evaluate((scrollPos) => {
      const getElRect = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height
        };
      };
      
      return {
        scrollY: window.scrollY,
        navbar: getElRect('header'),
        about: getElRect('#about'),
        heroContainer: getElRect('#home')
      };
    }, pos);

    console.log(`At scrollY = ${pos}:`, info);
    
    const screenshotPath = path.join(__dirname, `scroll_pos_${pos}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot to: ${screenshotPath}`);
  }

  await browser.close();
}

run().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});

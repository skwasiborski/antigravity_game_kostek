const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('file://' + __dirname + '/index.html');
  await new Promise(r => setTimeout(r, 500));
  
  console.log('Clicking settings...');
  await page.evaluate(() => {
      document.getElementById('settings-btn').click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({path: 'screenshot.png'});
  
  console.log('Done.');
  await browser.close();
})();

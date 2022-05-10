const puppeteer = require('puppeteer');

(async () => {
  try {
    const url = 'https://mrcong.com/tag/djawa/page/1/'
    const minimal_args = [
      '--autoplay-policy=user-gesture-required',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-dev-shm-usage',
      '--disable-domain-reliability',
      '--disable-extensions',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-notifications',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-popup-blocking',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-setuid-sandbox',
      '--disable-speech-api',
      '--disable-sync',
      '--hide-scrollbars',
      '--ignore-gpu-blacklist',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--password-store=basic',
      '--use-gl=swiftshader',
      '--use-mock-keychain',
    ];

    const browser = await puppeteer.launch({
      args: minimal_args,
      executablePath: '/usr/bin/chromium'
    });
    const page = await browser.newPage();
 
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36')
    await page.setDefaultNavigationTimeout(0);

    await page.goto(url);
    await page.waitForTimeout(1000)

    const linksArr = await page.evaluate( () => {
      const links = document.querySelectorAll('.footer-widget-container a')
      let arr = []
        for (const element of links) {
          arr.push({
            name: element.innerText,
            link: element.href
           })
         }
        return arr
    })
    console.log(linksArr)
    // await page.screenshot({path: 'test.png', fullPage: true})
    await browser.close();
  } catch (error) {
    console.log(error)
  }
})();

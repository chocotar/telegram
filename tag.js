const puppeteer = require('puppeteer');
const { minimal_args } = require('./utilities');

let dataUrl = {}

const tagSearch = async url => {
  try {
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
      const links = document.querySelectorAll('.post-box-title a')
      let arr = []
        for (const element of links) {
          arr.push({
            name: element.innerText,
            link: element.href
           })
         }
        return arr
    })
    dataUrl.data = linksArr
    return linksArr
    // await page.screenshot({path: 'test.png', fullPage: true})
    await browser.close();
  } catch (error) {
    console.log(error)
  }
};

module.exports = { tagSearch, dataUrl }

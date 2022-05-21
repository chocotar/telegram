const https = require('node:https');
const axios = require('axios');
const cheerio = require('cheerio');
const { dataUrl, getPageNumber } = require('./handler')
const agent = new https.Agent({  
  rejectUnauthorized: false
});


const tagSearch = async url => {
  try {
    const res = await axios.get(url, {httpsAgent: agent})
    console.log(res)
    console.log(response)
    dataUrl.page = getPageNumber(url)
    const $ = cheerio.load(data)
    const element = $('h2.post-box-title > a')
    const arr = []
    element.each((index, el) => {
      if ($(el).text() && $(el).attr('href')) {
        arr[index] = { name: $(el).text(), link: $(el).attr('href') }
      }
    })
    return arr 
  } catch(err) {
    return false
    console.log(err)
  }
};

module.exports.tagSearch = tagSearch

tagSearch('https://mrcong.com/tag/djawa/page/10/')

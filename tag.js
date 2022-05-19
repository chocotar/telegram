const https = require('node:https');
const axios = require('axios');
const cheerio = require('cheerio');
const { dataUrl, getPageNumber } = require('./handler')
const agent = new https.Agent({  
  rejectUnauthorized: false
});


const tagSearch = async url => {
  try {
    const { data } = await axios.get(url, {httpsAgent: agent})
    dataUrl.page = getPageNumber(url)
    const $ = cheerio.load(data)
    const element = $('h2.post-box-title > a')
    const arr = []
    element.each((index, el) => {
      if ($(el).text() && $(el).attr('href')) {
        arr[index] = { name: $(el).text(), link: $(el).attr('href') }
      }
    })
    console.log(arr)
    return arr 
  } catch(err) {
    console.log(err)
  }
};

module.exports.tagSearch = tagSearch

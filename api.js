const https = require('node:https');
const axios = require('axios');
const cheerio = require('cheerio');

const agent = new https.Agent({  
  rejectUnauthorized: false
});
const getLink = async url => {
  const promise = await axios.get(url, {httpsAgent: agent})
  return promise
}

const req = getLink('https://mrcong.com/tag/djawa/page/1/')

req
  .then(
    response => {
      const html = response.data
      const $ = cheerio.load(html)
      const name = $('div.gs-title a.gs-title').text()
      console.log(name)
    }
  )

module.exports.getLink = getLink

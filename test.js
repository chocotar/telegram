const https = require('node:https');
const axios = require('axios');
const cheerio = require('cheerio');

const agent = new https.Agent({  
  rejectUnauthorized: false
});
const getLink = async url => {
  try {
    const res = await axios.get(url, {httpsAgent: agent})
  
    const $ = cheerio.load(res)
    const element = $('.post-box-title').html()
    console.log(element)
  } catch(err) {
    console.log(err)
  }
}

getLink('https://mrcong.com')

const https = require('node:https');
const axios = require('axios');
const cheerio = require('cheerio');

const agent = new https.Agent({  
  rejectUnauthorized: false
});
const getLink = async url => {
  const res = await axios.get(url, {httpsAgent: agent})
  
  const $ = await cheerio.load(res)
  const element = await $('.post-box-title')
  await console.log(element)
}

getLink('https://mrcong.com')

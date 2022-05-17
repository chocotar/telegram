const https = require('node:https');
const axios = require('axios');
const cheerio = require('cheerio');

const agent = new https.Agent({  
  rejectUnauthorized: false
});
const res = axios.get(url, {httpsAgent: agent})
const getLink = async url => {
  const $ = await cheerio.load(res)
  const element = $('.post-box-title')
  console.log(element)
}

getLink('https://mrcong.com')

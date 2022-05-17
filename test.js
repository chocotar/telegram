const https = require('node:https');
const axios = require('axios');
const cheerio = require('cheerio');

const agent = new https.Agent({  
  rejectUnauthorized: false
});
const url = 'https://mrcong.com'
const res = axios.get(url, {httpsAgent: agent})
const getLink = async () => {
  const $ = await cheerio.load(res)
  const element = $('.post-box-title')
  console.log($)
}

getLink()

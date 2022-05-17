const https = require('node:https');
const axios = require('axios');
const cheerio = require('cheerio');

const agent = new https.Agent({  
  rejectUnauthorized: false
});
const getLink = async url => {
  try {
    const { data } = await axios.get(url, {httpsAgent: agent})
  
    const $ = cheerio.load(data)
    const element = $('h2.post-box-title > a')
    const arr = []
    element.each((index, el) => {
      arr[index] = { name: $(el).text(), link: $(el).attr('href') }
    })
    console.log(arr)
  } catch(err) {
    console.log(err)
  }
}

getLink('https://mrcong.com')

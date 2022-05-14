const cheerio = require('cheerio');
const { getLink } = require('./api');

const errorHandler = (bot, chatId) => {
  return (err => {
    console.log(err)
    bot.sendMessage(chatId, err.code, opts())
  });
};

const findPromiseHandler = (bot, chatId, messageId, query) => {
  return (url => {
    if (url.result) {
      if (url.reason == 'keyboard') {
        const sendKeyboard = inlineKeyboard(url.result)
        bot.deleteMessage(chatId, messageId)
        bot.sendMessage(chatId, query, opts(true, url.result));
      } else {
        console.log(`Got: ${url.result}`)
        getLink(url.result)
          .then(scrapePromiseHandler(bot, chatId, url.result))
          .catch(errorHandler(bot, chatId))
      }
    } else {
      bot.deleteMessage(chatId, messageId)
      bot.sendMessage(chatId, url.reason, opts());
    }
  });
};

const scrapePromiseHandler = (bot, chatId, messageId, url) => {
  const mainPageCheck = isMainPageUrl(url)
  const isCreateData = process.env.CREATE_DATA || false
  let str
  if (mainPageCheck) {
    return (response => {
      const html = response.data
      const $ = cheerio.load(html)
    
      const isParts = $('a.shortc-button.medium.green').length
    
      const name = $('h1.name.post-title.entry-title').text()
      const link = $('a.shortc-button.medium.green').attr('href')
      
      if (isParts > 1) {
        const linkNodeList = $('a.shortc-button.medium.green')
        const links = []
    
        for (let i = 0; i < isParts; i++) {
          const pageUrl = linkNodeList[i].attribs.href
          links.push(pageUrl)
        }
        console.log(links)
        toWriteData(name, links, isCreateData)
        const rLinks = links.join(`\n\n<b>Another part:</b> `)
        str = `<b>Name:</b> ${name}\n\n<b>Link part 1:</b> ${rLinks}`
        bot.deleteMessage(chatId, messageId)
        bot.sendMessage(chatId, str, opts());
      }else {
        console.log(link)
        toWriteData(name, link, isCreateData)
        str = `<b>Name:</b> ${name}\n\n<b>Link:</b> ${link}`
        bot.deleteMessage(chatId, messageId)
        bot.sendMessage(chatId, str, opts());
      }
    })
  }else {
    str = `<i>${url}</i> is not main page`
    bot.deleteMessage(chatId, messageId)
    bot.sendMessage(chatId, str, opts());
  }
};

const tagHandler = (bot, chatId) => {
  return ( response => {
    const res = inlineKeyboardBuilder(response)
    const options = opts(true, res[1])
    console.log(options.reply_markup.inline_keyboard[0])
    bot.sendMessage(chatId, res[0], options)
    }
  )
}

const inlineKeyboardBuilder = (data, index=0) => {
  const str = [], keyboardBuilder = []
  for( i = index; i < index + 5; i++) {
    str.push(`${i+1}. ${data[i].name}`)
    keyboardBuilder.push({
      text: new String(i+1),
      callback_query: new String(i)
    })
  }
  const textBuilder = str.join('\n\n')
  const toJson = JSON.stringify(keyboardBuilder)
  return [textBuilder, JSON.parse(toJson)]
}
const opts = (isKeyboard=false, query=null) => {
  if (isKeyboard) {
    return {
      "reply_markup":{
        "inline_keyboard": [query]
      },
        "parse_mode": "HTML"
    };
  }
  return { "parse_mode": "HTML"}
}

const isMainPageUrl = url => {
  return url.match(/.+(anh\/|videos\/|video\/)$/i)
};

const toWriteData = (name, link, isCreateData) => {
  if (isCreateData) {
   return writeData({name, link})
  }
  return
}

const tag = [
    { name: 'XIUREN', link: 'https://mrcong.com/tag/xiuren/' },
    { name: 'UGIRLS', link: 'https://mrcong.com/tag/ugirls/' },
    { name: 'LegBaby', link: 'https://mrcong.com/tag/legbaby/' },
    { name: 'TuiGirl', link: 'https://mrcong.com/tag/tuigirl/' },
    { name: 'BoLoli', link: 'https://mrcong.com/tag/bololi/' },
    { name: 'MiStar', link: 'https://mrcong.com/tag/mistar/' },
    { name: 'FEILIN', link: 'https://mrcong.com/tag/feilin/' },
    { name: 'MFStar', link: 'https://mrcong.com/tag/mfstar/' },
    { name: 'UXING', link: 'https://mrcong.com/tag/uxing/' },
    { name: 'WingS', link: 'https://mrcong.com/tag/wings/' },
    { name: 'IMISS', link: 'https://mrcong.com/tag/imiss/' },
    { name: 'MyGirl', link: 'https://mrcong.com/tag/mygirl/' },
    { name: 'MiiTao', link: 'https://mrcong.com/tag/miitao/' },
    { name: 'YouWu', link: 'https://mrcong.com/tag/youwu/' },
    { name: 'TASTE', link: 'https://mrcong.com/tag/taste/' },
    { name: 'LeYuan', link: 'https://mrcong.com/tag/leyuan/' },
    { name: 'HuaYan', link: 'https://mrcong.com/tag/huayan/' },
    { name: 'Tukmo', link: 'https://mrcong.com/tag/tukmo/' },
    { name: 'Kimoe', link: 'https://mrcong.com/tag/kimoe/' },
    { name: 'TouTiao', link: 'https://mrcong.com/tag/toutiao/' },
    { name: 'TGOD', link: 'https://mrcong.com/tag/tgod/' },
    { name: 'QingDouKe', link: 'https://mrcong.com/tag/qingdouke/' },
    { name: 'CANDY', link: 'https://mrcong.com/tag/candy/' },
    { name: 'DKGirl', link: 'https://mrcong.com/tag/dkgirl/' },
    { name: 'YouMi', link: 'https://mrcong.com/tag/youmi/' },
    { name: 'MintYe', link: 'https://mrcong.com/tag/mintye/' },
    { name: 'KelaGirls', link: 'https://mrcong.com/tag/kelagirls/' },
    { name: 'MF', link: 'https://mrcong.com/tag/mf/' },
    { name: 'ISHOW', link: 'https://mrcong.com/tag/ishow/' },
    { name: 'FToow', link: 'https://mrcong.com/tag/ftoow/' }
  ]
  
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
  
module.exports = { scrapePromiseHandler, tagHandler, findPromiseHandler, errorHandler, isMainPageUrl, tag, minimal_args };

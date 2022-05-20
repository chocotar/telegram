const cheerio = require('cheerio');
const https = require('node:https');
const axios = require('axios');
const { getLink } = require('./api');
const { Link } = require('./db')
const IS_DB = process.env.IS_DB || false
const dataUrl = {}

const errorHandler = (bot, chatId) => {
  return (err => {
    console.log(err)
    bot.sendMessage(chatId, err.code, opts())
  });
};

const findPromiseHandler = (bot, chatId, botMsg, query) => {
  return (url => {
    if (url.result) {
      const keyboardBuild = inlineKeyboardBuilder(url.result)
      if (botMsg) botMsg.then(deleteMessageHandler(bot)).catch(errorHandler(bot, chatId))
      bot.sendMessage(chatId, keyboardBuild[0], opts(true, keyboardBuild[1]));
    } else {
      if (botMsg) botMsg.then(deleteMessageHandler(bot)).catch(errorHandler(bot, chatId))
      bot.sendMessage(chatId, url.reason, opts());
    }
  });
};

const scrapePromiseHandler = (bot, chatId, botMsg, url) => {
  const mainPageCheck = isMainPageUrl(url)
  const isWriteData = process.env.WRITE_DATA || false
  let str
  if (mainPageCheck) {
    console.log(`Got: ${url}`)
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
  
        if (IS_DB) insertToDb({ name, link: links })

        const rLinks = links.join(`\n\n<b>Another part:</b> `)
        str = `<b>Name:</b> ${name}\n\n<b>Link part 1:</b> ${rLinks}`
        if (botMsg) botMsg.then(deleteMessageHandler(bot)).catch(errorHandler(bot, chatId))
        bot.sendMessage(chatId, str, opts());
      } else {
        console.log(link)

        if (IS_DB) insertToDb({ name, link })

        str = `<b>Name:</b> ${name}\n\n<b>Link:</b> ${link}`
        if (botMsg) botMsg.then(deleteMessageHandler(bot)).catch(errorHandler(bot, chatId))
        bot.sendMessage(chatId, str, opts());
      }
    })
  } else {
    str = `<i>${url}</i> is not main page`
    if (botMsg) botMsg.then(deleteMessageHandler(bot)).catch(errorHandler(bot, chatId))
    bot.sendMessage(chatId, str, opts());
  }
};

const tagHandler = (bot, chatId, botMsg) => {
  return ( response => {
    dataUrl.data = response
    const res = inlineKeyboardBuilder(response)
    const options = opts(true, res[1])
    if (botMsg) botMsg.then(deleteMessageHandler(bot)).catch(errorHandler(bot, chatId))
    const msg = bot.sendMessage(chatId, res[0], options)
    }
  )
}

const deleteMessageHandler = (bot) => {
  return ( msg => {
    const messageId = msg.message_id
    const chatId = msg.chat.id
    bot.deleteMessage(chatId, messageId)
  })
}


const grabber = async (bot, chatId, botMsg, baseUrl, page) => {
  let pageNum = 1 
  try {
    const { message_id } = botMsg
    while (pageNum <= page) {
      const url = `${baseUrl}/page/${pageNum}`
      const data = await tagSearch(url)
      for (const element of data) {
        const check = await Link.isDuplicate(element.name)
        if (!check) {
          const db = new Link({ name: element.name, link: element.link })
          const save = await db.save()
          if (!dataUrl.msg) dataUrl.msg = bot.editMessageText(`<i>${save.name}</i> <b>Grabbed</b>`, { chat_id: chatId, message_id, parse_mode: 'HTML' })
          if (dataUrl.msg) {
            const { message_id } = dataUrl.msg
            dataUrl.msg = bot.editMessageText(`<i>${save.name}</i> <b>Grabbed</b>`, { chat_id: chatId, message_id, parse_mode: 'HTML' })
          }
          console.log(save.name)
        } else {
          console.log("Data already inserted")
        }
      }
    pageNum++
    }
    return 'done'
  } catch (err) {
    console.log(err)
  }
}

////////////////////////// Helper ////////////////////////

const tagSearch = async url => {
  try {
    const agent = new https.Agent({ rejectUnauthorized: false });
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
    return arr 
  } catch(err) {
    console.log(err)
  }
};

const inlineKeyboardBuilder = (data, index=0) => {
  const lastPageRoll = data.length % 5
  const totalPageRoll = data.length - lastPageRoll
  let pageRoll = index + 5
  if (index >= totalPageRoll) pageRoll = data.length
  const str = [], keyboardBuilder = []
  for( i = index; i < pageRoll; i++) {
    str.push(`${i+1}. ${data[i].name}`)
    keyboardBuilder.push({
      text: i+1,
      callback_data: i
    })
  }
  const time = new Date()
  const minutes = time.getMinutes(), seconds = time.getSeconds()

  dataUrl.nextIndex = index+5
  const arr = dataUrl.data
  const { page } = dataUrl
  str.push(`\n<i>${minutes}:${seconds}</i>`)
  const textBuilder = str.join('\n\n')

  if (index >= 5) keyboardBuilder.unshift({ text: '<<', callback_data: 'prev' })
  if (index < arr.length-5)keyboardBuilder.push({ text: '>>', callback_data: index+5 })
  if (index == arr.length-5 && page )keyboardBuilder.push({ text: `Page ${page+1}`, callback_data: 'nextPage' })
  if (index == 0 && page > 1) keyboardBuilder.unshift({ text: `Page ${page-1}`, callback_data: 'prevPage' })

  return [textBuilder, keyboardBuilder]
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

const insertToDb = (obj) => {
  const check = Link.isDuplicate(obj.name)
  check.then((isDup) => {
    if (!isDup) {
      var db = new Link(obj)
      db.save().then((result) => console.log(result)).catch((err) => console.log(err))
    } else {
      console.log('Data already inserted')
    }
  }).catch((err) => console.log(err))
}

const isMainPageUrl = url => {
  return url.match(/.+(anh\/|videos\/|video\/)$/)
};

const isTagUrl = url => {
  return url.match(/.+(\/tag\/).+/)
}

const getPageNumber = url => {
  const regExp = url.match(/(\/\d\/)$/)
  if (regExp) {
    return Number(regExp[0].split('/')[1])
  }
  return regExp
}

module.exports = { grabber, dataUrl, isMainPageUrl, isTagUrl, getPageNumber, inlineKeyboardBuilder, opts, scrapePromiseHandler, tagHandler, deleteMessageHandler, findPromiseHandler, errorHandler };

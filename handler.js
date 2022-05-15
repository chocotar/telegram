const cheerio = require('cheerio');
const { getLink } = require('./api');
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
      if (url.reason == 'keyboard') {
        const keyboardBuild = inlineKeyboardBuilder(url.result)
        if (botMsg) botMsg.then(deleteMessageHandler(bot)).catch(errorHandler(bot, chatId))
        bot.sendMessage(chatId, keyboardBuild[0], opts(true, keyboardBuild[1]));
      } else {
        console.log(`Got: ${url.result}`)
        getLink(url.result)
          .then(scrapePromiseHandler(bot, chatId, botMsg, url.result))
          .catch(errorHandler(bot, chatId))
      }
    } else {
      if (botMsg) botMsg.then(deleteMessageHandler(bot)).catch(errorHandler(bot, chatId))
      bot.sendMessage(chatId, url.reason, opts());
    }
  });
};

const scrapePromiseHandler = (bot, chatId, botMsg, url) => {
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
        if (botMsg) botMsg.then(deleteMessageHandler(bot)).catch(errorHandler(bot, chatId))
        bot.sendMessage(chatId, str, opts());
      }else {
        console.log(link)
        toWriteData(name, link, isCreateData)
        str = `<b>Name:</b> ${name}\n\n<b>Link:</b> ${link}`
        if (botMsg) botMsg.then(deleteMessageHandler(bot)).catch(errorHandler(bot, chatId))
        bot.sendMessage(chatId, str, opts());
      }
    })
  }else {
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

////////////////////////// Helper ////////////////////////
// I put all helper requirements in one file to avoid circular dependency error though it was messed up :( //

const inlineKeyboardBuilder = (data, index=0) => {
  const str = [], keyboardBuilder = []
  for( i = index; i < index + 5; i++) {
    str.push(`${i+1}. ${data[i].name}`)
    keyboardBuilder.push({
      text: i+1,
      callback_data: i
    })
  }
  dataUrl.nextIndex = index+5
  const arr = dataUrl.data
  const { page } = dataUrl
  const textBuilder = str.join('\n\n')

  if (index >= 5) keyboardBuilder.unshift({ text: '<<', callback_data: 'prev' })
  if (index < arr.length-5)keyboardBuilder.push({ text: '>>', callback_data: index+5 })
  if (index == arr.length-5 && page )keyboardBuilder.push({ text: `Page ${page+1}`, callback_data: 'nextPage' })
  if (index >= 5 && page > 1) keyboardBuilder.unshift({ text: `Page ${page-1}`, callback_data: 'prevPage' })

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

const toWriteData = (name, link, isCreateData) => {
  if (isCreateData) {
   return writeData({name, link})
  }
  return
}

module.exports = { dataUrl, isMainPageUrl, isTagUrl, getPageNumber, inlineKeyboardBuilder, opts, toWriteData,scrapePromiseHandler, tagHandler, deleteMessageHandler, findPromiseHandler, errorHandler };

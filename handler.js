const cheerio = require('cheerio');
const { getLink } = require('./api');
const { isMainPageUrl, inlineKeyboardBuilder, opts, toWriteData } = require('./helper')
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
    const res = inlineKeyboardBuilder(response, isTag=true)
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

module.exports = { dataUrl, opts, inlineKeyboardBuilder, scrapePromiseHandler, tagHandler, deleteMessageHandler, findPromiseHandler, errorHandler, isMainPageUrl };

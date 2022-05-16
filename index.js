require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const token = process.env.TOKEN
const PORT = process.env.PORT || 8000
const IS_DB = process.env.IS_DB || false
const { isTagUrl, isMainPageUrl, getPageNumber, inlineKeyboardBuilder, opts, tagHandler, deleteMessageHandler, findPromiseHandler, scrapePromiseHandler, errorHandler, dataUrl } = require('./handler');
const { tag } = require('./utilities')
const { search } = require('./finder');
const { getLink } = require('./api');
const { tagSearch } = require('./tag');
const { main } = require('./db')
const btn = {}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const htmlParse = { parse_mode: 'HTML' }

const app = express()
if (IS_DB) main()

// Matches "/find [whatever]"
bot.onText(/\/find (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1];
  const args = resp.split(' ')
  
  const botMsg = bot.sendMessage(chatId, `<b>Finding:</b> <i>${resp}</i>`, htmlParse);
  
  if (args.length == 1) {
    for (const element of tag) {
      if (element.name.toLowerCase() == args[0].toLowerCase()) {
        dataUrl.url = element.link
        const addPage = `${element.link}page/1/`
        tagSearch(addPage).then(tagHandler(bot, chatId, botMsg)).catch(errorHandler(bot, chatId))
        return
      }
    }
  }
// start to find
  search(resp).then(findPromiseHandler(bot, chatId, botMsg, resp)).catch(errorHandler(bot, chatId))
});

bot.onText(/\/scrape (.+)/, (msg, match) => {
  
  const chatId = msg.chat.id;
  const resp = match[1]

  const botMsg = bot.sendMessage(chatId, `<b>Scraping:</b> <i>${resp}</i>`, htmlParse);

  getLink(resp)
    .then(scrapePromiseHandler(bot, chatId, botMsg, resp))
    .catch(errorHandler(bot, chatId))
});

bot.on('callback_query', callbackQuery => {
  const chatId = callbackQuery.message.chat.id
  const { message_id } = callbackQuery.message
  const query = callbackQuery.data
  const { data, nextIndex } = dataUrl

  // Next button
  if (query == nextIndex) {
    const keyboardBuild = inlineKeyboardBuilder(data, nextIndex)
    const { reply_markup, parse_mode } = opts(true, keyboardBuild[1])

    btn.nextMsg = bot.editMessageText(keyboardBuild[0], { chat_id: chatId, message_id, reply_markup, parse_mode })
    return
  } else if (query == 'prev') { // prev button
    const keyboardBuild = inlineKeyboardBuilder(data, nextIndex-10)
    const options  = opts(true, keyboardBuild[1])
    const { nextMsg, prevMsg } = btn
    const nChatId = nextMsg._rejectionHandler0.chat.id
    const nMessageId = nextMsg._rejectionHandler0.message_id
    
    if (btn.prevMsg) {
      const pChatId = prevMsg._rejectionHandler0.chat.id
      const pMessageId = prevMsg._rejectionHandler0.message_id
      bot.deleteMessage(pChatId, pMessageId)
      btn.prevMsg = bot.sendMessage(pChatId, keyboardBuild[0], options)
      return
    }

    bot.deleteMessage(nChatId, nMessageId)
    btn.prevMsg = bot.sendMessage(nChatId, keyboardBuild[0], options)
    return
  } else if (query == 'nextPage') {
    const { url, page } = dataUrl
    const link = `${url}page/${page+1}/`
    
    bot.deleteMessage(chatId, message_id)
    tagSearch(link).then(tagHandler(bot, chatId, null)).catch(errorHandler(bot, chatId))
    return
  }
  
  bot.deleteMessage(chatId, message_id)
  
  if (isMainPageUrl(data[query].link)) {
    getLink(data[query].link)
      .then(scrapePromiseHandler(bot, chatId, null, data[query].link))
      .catch(errorHandler(bot, chatId))
  } else if (isTagUrl(data[query].link)) {
    tagSearch(data[query].link).then(tagHandler(bot, chatId, null)).catch(errorHandler(bot, chatId))
  } else {
    bot.sendMessage(chatId, '<b>Can\'t continue to find</b>', htmlParse)
  }
});

bot.on('polling_error', (error) => {
  console.log(error);  // => 'EFATAL'
});

// Error  handling
bot.on('error', (error) => {
  console.log(error.code);  // => 'EFATAL'
});
// Server
app.get('/', (req, res) => {
  res.send("It's Running")
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

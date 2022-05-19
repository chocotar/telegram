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
      dataUrl.url = element.link
      const addPage = `${element.link}page/1/`
      if (element.name.toLowerCase() == args[0].toLowerCase()) {
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
    bot.editMessageText(keyboardBuild[0], { chat_id: chatId, message_id, reply_markup, parse_mode })
    
  } else if (query == 'prev') { // prev button
    const keyboardBuild = inlineKeyboardBuilder(data, nextIndex - 10)
    const { reply_markup, parse_mode } = opts(true, keyboardBuild[1])
    bot.editMessageText(keyboardBuild[0], { chat_id: chatId, message_id, reply_markup, parse_mode })

  } else if (query == 'nextPage') {
    const { url, page } = dataUrl
    const link = `${url}page/${page+1}/`
    
    bot.deleteMessage(chatId, message_id)
    const botMsg = bot.sendMessage(chatId, '<i>Getting next page...</i>', htmlParse)
    tagSearch(link).then(tagHandler(bot, chatId, botMsg)).catch(errorHandler(bot, chatId))
  } else if (query == 'prevPage') {
    const { url, page } = dataUrl
    const link = `${url}page/${page-1}/`
    
    bot.deleteMessage(chatId, message_id)
    const botMsg = bot.sendMessage(chatId, '<i>Getting previous page...</i>', htmlParse)
    tagSearch(link).then(tagHandler(bot, chatId, botMsg)).catch(errorHandler(bot, chatId))
  } else {
    bot.deleteMessage(chatId, message_id)
    const botMsg = bot.sendMessage(chatId, '<i>Getting link...</i>', htmlParse)
  
    if (isMainPageUrl(data[query].link)) {
      getLink(data[query].link)
        .then(scrapePromiseHandler(bot, chatId, botMsg, data[query].link))
        .catch(errorHandler(bot, chatId))
    } else if (isTagUrl(data[query].link)) {
      dataUrl.url = data[query].link
      const addPage = `${data[query].link}page/1/`
      tagSearch(addPage).then(tagHandler(bot, chatId, botMsg)).catch(errorHandler(bot, chatId))
    } else {
      bot.sendMessage(chatId, '<b>Can\'t continue to find</b>', htmlParse)
    }
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

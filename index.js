require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const token = process.env.TOKEN
const PORT = process.env.PORT || 8000
const { tagHandler, deleteMessageHandler, findPromiseHandler, scrapePromiseHandler, errorHandler, isMainPageUrl, dataUrl, inlineKeyboardBuilder, opts } = require('./handler');
const { tag } = require('./utilities')
const { search } = require('./finder');
const { getLink } = require('./api');
const { tagSearch } = require('./tag');
const btn = {}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const htmlParse = { parse_mode: 'HTML' }

const app = express()

// Matches "/find [whatever]"
bot.onText(/\/find (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1];
  const args = resp.split(' ')
  
  const botMsg = bot.sendMessage(chatId, `<b>Finding:</b> <i>${resp}</i>`, htmlParse);
  
  if (args.length == 1) {
    for (const element of tag) {
      if (element.name.toLowerCase() == args[0].toLowerCase()) {
        tagSearch(element.link).then(tagHandler(bot, chatId, botMsg)).catch(errorHandler(bot, chatId))
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
  console.log(callbackQuery)
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
    const keyboardBuild = inlineKeyboardBuilder(data, nextIndex-5)
    const options  = opts(true, keyboardBuild[1])
    const { nextMsg } = btn
    const nChatId = nextMsg._rejectionHandler0.chat.id
    const nMessageId = nextMsg._rejectionHandler0.message_id
  
    btn.prevMsg = bot.sendMessage(nChatId, keyboardBuild[0], options)
    return
  }
  
  bot.deleteMessage(chatId, message_id)

  getLink(data[query].link)
    .then(scrapePromiseHandler(bot, chatId, null, data[query].link))
    .catch(errorHandler(bot, chatId))
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

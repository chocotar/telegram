require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const token = process.env.TOKEN
const PORT = process.env.PORT || 8000
const { tagHandler, findPromiseHandler, scrapePromiseHandler, errorHandler, isMainPageUrl, messageId } = require('./handler');
const { tag } = require('./utilities')
const { search } = require('./finder');
const { getLink } = require('./api');
const { tagSearch } = require('./tag');

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
  const chatId = callbackQuery.message.chat.id
  const botMsg = callbackQuery.message.message_id
  const query = callbackQuery.data
  console.log(query, messageId)
  if (isMainPageUrl(query)) {
    //getLink(query).then(scrapePromiseHandler(bot, chatId, botMsg, query)).catch(errorHandler(bot, chatId))
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

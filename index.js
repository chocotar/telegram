require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const token = process.env.TOKEN
const PORT = process.env.PORT || 8000
const { tag, tagHandler, findPromiseHandler, scrapePromiseHandler, errorHandler } = require('./handler');
const { search } = require('./finder');
const { getLink } = require('./api');
const { tagSearch } = require('./tag');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const htmlParse = { parse_mode: 'HTML' }

const app = express()

// Matches "/find [whatever]"
bot.onText(/\/find (.+)/, (msg, match) => {
const options = { reply_markup: 
                   { inline_keyboard: [[{"text": "Hello", "callback": "YES"}]]
                   }
                 }

  const chatId = msg.chat.id;
  const messageId = msg.message_id
  const resp = match[1];
  const args = resp.split(' ')
  
  bot.sendMessage(chatId, `<b>Finding:</b> <i>${resp}</i>`, options);
  
  if (args.length == 1) {
    for (const element of tag) {
      if (element.name.toLowerCase() == args[0].toLowerCase()) {
        console.log(true)
        tagSearch(element.link).then(tagHandler(bot, chatId)).catch(errorHandler(bot, chatId))
        return
      }
    }
  }
  // start to find
  search(resp).then(findPromiseHandler(bot, chatId, messageId, resp)).catch(errorHandler(bot, chatId))
});

bot.onText(/\/scrape (.+)/, (msg, match) => {
  
  const chatId = msg.chat.id;
  const messageId = msg.message_id
  const resp = match[1]

  bot.sendMessage(chatId, `<b>Scraping:</b> <i>${resp}</i>`, htmlParse);

  getLink(resp)
    .then(scrapePromiseHandler(bot, chatId, messageId, resp))
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

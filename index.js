require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const token = process.env.TOKEN
const PORT = process.env.PORT || 8000

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const opts = {
  reply_markup:{
    inline_keyboard: [[
      {
        "text": "1",
        "callback_data": "ONE"
      },
      {
        "text": "2",
        "callback_data": "TWO"
      }
      ]] // add keyboard response text
  },
  parse_mode: 'HTML'
};
const app = express()

// Matches "/find [whatever]"
bot.onText(/\/find (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  bot.sendMessage(chatId, `<b>Finding:</b> <i>${resp}</i>`, opts);
});

bot.onText(/\/scrape (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1]

  bot.sendMessage(chatId, `<b>Scraping:</b> <i>${resp}</i>`, opts);
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

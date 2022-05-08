const inlineKeyboard = (text, callback) => {
  const query = text.map( (textEl) => {
    callback.map( (callbackEl) => {
        return JSON.stringify({
          'text': textEl,
          'callback_data': callbackEl
        })
    })
  })
}

const a = ['A', 'B', 'C']
const b = ['1', '2', '3']

console.log(inlineKeyboard(a,b))

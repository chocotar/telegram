const inlineKeyboard = (text, callback) => {
  const query = text.map( (e, i) => {
      return {
        'text': e,
        'callback_data': callback[i]
      }
  })
  const obj = Object.fromEntries(query)
  return JSON.stringify(obj)
}

const a = ['A', 'B', 'C']
const b = ['1', '2', '3']

console.log(inlineKeyboard(a,b))

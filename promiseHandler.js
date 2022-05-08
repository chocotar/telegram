const inlineKeyboard = (text, callback) => {
  const query = text.map( (e, i) => {
      return JSON.stringify({
        text: e,
        callback_data: callback[i]
      })
  })
  return query
}

const a = ['A', 'B', 'C']
const b = ['1', '2', '3']

console.log(inlineKeyboard(a,b))

const inlineKeyboard = (text, callback) => {
  const query = text.map( (e, i) => {
      return {
        'text': e,
        'callback_data': callback[i]
      }
  })
  console.log(JSON.stringify(query))
  return query
}

const a = ['A', 'B', 'C']
const b = ['1', '2', '3']

console.log(inlineKeyboard(a,b))

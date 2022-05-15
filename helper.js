const inlineKeyboardBuilder = (data, index=0) => {
  const str = [], keyboardBuilder = []
  for( i = index; i < index + 5; i++) {
    str.push(`${i+1}. ${data[i].name}`)
    keyboardBuilder.push({
      text: i+1,
      callback_data: i
    })
  }
  dataUrl.nextIndex = index+5
  const arr = dataUrl.data
  const { page } = dataUrl
  const textBuilder = str.join('\n\n')

  if (index >= 5) keyboardBuilder.unshift({ text: '<<', callback_data: 'prev' })
  if (index < arr.length-5)keyboardBuilder.push({ text: '>>', callback_data: index+5 })
  if (index == arr.length-5 && page )keyboardBuilder.push({ text: `Page ${page+1}`, callback_data: 'nextPage' })
  if (index >= 5 && page > 1) keyboardBuilder.unshift({ text: `$Page {page-1}`, callback_data: 'prevPage' })

  return [textBuilder, keyboardBuilder]
}

const opts = (isKeyboard=false, query=null) => {
  if (isKeyboard) {
    return {
      "reply_markup":{
        "inline_keyboard": [query]
      },
        "parse_mode": "HTML"
    };
  }
  return { "parse_mode": "HTML"}
}

const isMainPageUrl = url => {
  return url.match(/.+(anh\/|videos\/|video\/)$/)
};

const isTagUrl = url => {
  return url.match(/.+(\/tag\/).+/)
}

const getPageNumber = url => {
  const regExp = url.match(/(\/\d\/)$/)
  if (regExp) {
    return Number(regExp[0].split('/')[1])
  }
  return regExp
}

const toWriteData = (name, link, isCreateData) => {
  if (isCreateData) {
   return writeData({name, link})
  }
  return
}

module.exports = { isMainPageUrl, isTagUrl, getPageNumber, inlineKeyboardBuilder, opts, toWriteData }

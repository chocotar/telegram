const inlineKeyboard = (text) => {
  return text.map( (e) => e.split(','))
}

const a = ["YouMi Vol.753: Zhu Ke Er (朱可儿Flora) (86 ảnh)", "XIUREN No.4272: Zhu Ke Er (朱可儿Flora) (58 ảnh)", "XIUREN No.4402: 李雅柔182CM (64 ảnh)"]

console.log(inlineKeyboard(a))

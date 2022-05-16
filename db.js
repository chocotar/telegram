const mongoose = require('mongoose');
const URI = process.env.URI

const insertData = obj => {
  mongoose.connect(URI).then( () => console.log('Connected to Mongodb')).catch((err) => console.log(err))
  const Schema = mongoose.Schema

  const LinkSchema = new Schema({ 
    name: String, 
    link: Schema.types.mixed 
  })
  const Link = mongoose.model('link', LinkSchema)
  const linkDownload = new Link(obj)
  linkDownload.save((err, result) => {
    if (err) {
      return console.log(err)
    }
    console.log(result)
    mongoose.connection.close()
    return
  })
}

module.exports.insertData = insertData

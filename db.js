const mongoose = require('mongoose');
const URI = process.env.URI

const insertData = obj => {
  mongoose.connect(URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to Mongodb')
    const Schema = mongoose.Schema

    const LinkSchema = new Schema({ 
      name: { type: String, index: true }
      link: Schema.Types.Mixed 
    })
    const Link = mongoose.model('link', LinkSchema)
    const linkDownload = new Link(obj)
    linkDownload.save((err, result) => {
      if (err) {
        console.log(err)
        return mongoose.disconnect()
      }
      console.log(result)
      return mongoose.disconnect()
    })
  }).catch((err) => console.log(err))
  mongoose.disconnect()
}

module.exports.insertData = insertData

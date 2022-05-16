const mongoose = require('mongoose');
const URI = process.env.URI

const insertData = obj => {
  mongoose.connect(URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => { console.log('Connected to Mongodb')
  }).catch((err) => console.log(err))

  (async () => {
    try {
      const Schema = mongoose.Schema

      const LinkSchema = await new Schema({ 
        name: { type: String, index: true },
        link: Schema.Types.Mixed 
      })
      const Link = await mongoose.model('link', LinkSchema)
      const linkDownload = await new Link(obj)
      await linkDownload.save((err, result) => {
        if (err) {
          console.log(err)
          return mongoose.disconnect()
        }
        console.log(result)
        return mongoose.disconnect()
      })
    } catch (err) {
      console.log(err)
    }
  })();
  mongoose.disconnect()
}

module.exports.insertData = insertData

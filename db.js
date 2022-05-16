const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const URI = process.env.URI

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

const main = async () => {
    await mongoose.connect(URI, connectionParams)
      .then( () => console.log('Connected to Mongod'))
      .catch((err) => console.log(err))
    return mongoose
}

const LinkSchema = new Schema({ 
  name: String, 
  link: Schema.Types.Mixed 
})

const insertData = async obj => {
  await main().then( async mongoose => {
    try{
      const Link = await mongoose.model('link', LinkSchema)
      const linkDownload = await new Link({name: 'tets', link: 'abcd'})
      await linkDownload.save((err, result) => {
        if (err) {
          return console.log(err)
        }
        console.log(result)
        mongoose.connection.close()
        return
      })
    }
    finally{
        mongoose.connection.close();
    }
  });
}

module.exports = { main, insertData }

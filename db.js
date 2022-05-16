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
  no: { type: Number },
  name: { type: String },
  link: Schema.Types.Mixed 
})
const Link = mongoose.model('link', LinkSchema)

module.exports = { main, Link }

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://rezcoco:Zaki1234@cluster0.tg2sf.mongodb.net/mrcong?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const insertData = (obj) => {
  client.connect(err => {
  if (err) {
    return console.log(err)
  }
  const collection = client.db("mrcong").collection("links");
  // perform actions on the collection object
  collection.insertOne(obj, (err, result) => {
    if (err) {
      return console.log(err)
    }
    console.log('Inserted data =>', result)
  })
  client.close();
  });
}

module.exports.insertData = insertData

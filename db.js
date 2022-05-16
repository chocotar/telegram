const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://rezcoco:Zaki1234@cluster0.tg2sf.mongodb.net/mrcong?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const insertData = (obj) => {
  client.connect(err => {
  if (err) console.log(err)
  const collection = client.db("mrcong").collection("links");
  // perform actions on the collection object
 const insertResult = collection.insertOne(obj)
 console.log('Inserted data =>', insertResult)
  client.close();
  });
}

module.exports.insertData = insertData

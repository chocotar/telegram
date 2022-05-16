const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://rezcoco:Zaki1234@cluster0.tg2sf.mongodb.net/mrcong?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

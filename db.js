const mongoose = require('mongoose');
const URI = process.env.URI || 'mongodb+srv://rezcoco:<Zaki1234>@cluster0.tg2sf.mongodb.net/mrcong?retryWrites=true&w=majority'

mongoose.connect(URI).then( () => console.log('Success to connect')).catch((err) => console.log(err))

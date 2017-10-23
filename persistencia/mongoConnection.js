var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/payfast";

function createMongoConnection() {
    return mongoClient.connect(url, (err, db) => {
        if (err) throw err;
        console.log('Database mongo conectado!');
    });
}

module.exports = function () {
    return createMongoConnection;
}

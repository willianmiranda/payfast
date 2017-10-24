var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/payfast";

module.exports = function (app) {
    function createMongoConnection() {
        return mongoClient.connect(url, (err, db) => {
            if (err) throw err;
            app.locals.db = db;
            console.log('Database mongo conectado!');
        });
    }

    return createMongoConnection();
}

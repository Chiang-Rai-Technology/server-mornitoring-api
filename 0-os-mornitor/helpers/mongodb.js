const { MongoClient } = require('mongodb');
const { CONNECTION, DB } = require('../configs/db.constant');

module.exports.connect = () => {
    return new Promise(async (resolve, reject) => {
        MongoClient.connect(CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(dbs => resolve(dbs))
            .catch(error => reject(error))
    })
}

module.exports.close = dbs => {
    return new Promise(async (resolve, reject) => {
        await dbs.close()
            .then(result => resolve(result))
            .catch(error => reject(error))
    })
}
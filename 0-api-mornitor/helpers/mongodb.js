const { MongoClient } = require('mongodb');
const CONNECTION = 'mongodb://admin:gwtP%40ssw0rd@167.172.65.50:27017,167.172.65.75:27017,167.172.65.80:27017/?replicaSet=rs0&authSource=admin';
const DB = 'gpp_uat';

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
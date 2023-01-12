const MongoDB = require('../helpers/mongodb');

module.exports.logging = data => {
    return new Promise(async (resolve, reject) => {
        let dbs = await MongoDB.connect();
        await dbs
            .db('gpp_uat')
            .collection('mornitor_server')
            .updateOne({
                ip: data.ip
            }, {
                $setOnInsert: {
                    name: data.name,
                    description: null,
                    cr_date: new Date(),
                    cr_by: 'API OS MORNITORING',
                    cr_prog: '0-os-mornitor',
                },
                $set: {
                    cpu: data.cpu,
                    memory: data.memory,
                    disk: data.disk,
                    api: data.api,
                    upd_date: new Date(),
                    upd_by: 'API OS MORNITORING',
                    upd_prog: '0-os-mornitor'
                }
            }, {
                upsert: true
            })
            .then(result => resolve(result))
            .catch(error => reject(error))
            .finally(async () => await MongoDB.close(dbs));
    });
}
const MongoDB = require('../helpers/mongodb');

module.exports.logging = (ip, data) => {
    return new Promise(async (resolve, reject) => {
        let dbs = await MongoDB.connect();
        await dbs
            .db('gpp_uat')
            .collection('mornitor_api')
            .updateOne({
                ip: ip,
                name: data.name
            }, {
                $setOnInsert: {
                    description: null,
                    cr_date: new Date(),
                    cr_by: 'API OS MORNITORING',
                    cr_prog: '0-api-mornitor',
                },
                $set: {
                    path: data.path,
                    cpu: Number(data.cpu),
                    ram: Number(data.ram),
                    reset: Number(data.reset),
                    uptime: Number(data.uptime),
                    status: (data.status).toLowerCase(),
                    upd_date: new Date(),
                    upd_by: 'API OS MORNITORING',
                    upd_prog: '0-api-mornitor'
                }
            }, {
                upsert: true
            })
            .then(result => resolve(result))
            .catch(error => reject(error))
            .finally(async () => await MongoDB.close(dbs));
    });
}
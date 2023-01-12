(async function main() {
    await require('./helpers/express')()
        .then(app => (console.log('server is running...'), app))
        .then(async () => await require('./controllers/server.controllers')())
        .catch(error => (console.error(error), main()));
})();
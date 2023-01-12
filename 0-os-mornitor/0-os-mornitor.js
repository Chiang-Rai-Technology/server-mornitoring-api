(async function main() {
    await require('./helpers/express')()
        .then(app => (console.log('server is running...'), app))
        .then(async app => (await require('./controllers/server.controllers')(), app))
        .then(app => app.listen())
        .catch(error => (console.error(error), main()));
})();
(async function main() {
    const PORT = '8888';
    await require('./helpers/express')()
        .then(app => (console.log('server is running...'), app))
        .then(app => require('./routes/server.routes')(app))
        .catch(error => (console.error(error), main()));
})();
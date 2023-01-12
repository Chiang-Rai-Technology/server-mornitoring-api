const controller = require('../controllers/server.controllers');

module.exports = app => {
    app.post('/', controller)
}
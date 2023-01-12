const model = require('../models/server.model');

module.exports = async (request, response) => {
    try {
        const { headers, body } = request;
        const ip = (headers['cf-connecting-ip'] ? headers['cf-connecting-ip'] : headers['x-real-ip']) || '0.0.0.0';
        const { name, path, cpu, ram, reset, uptime, status } = body;
        if (!name || !path || !cpu || !ram || !reset || !uptime || !status) throw { status: '100', message: 'invalid parameter' }
        await model.logging(ip, body);
        response.send({ status: '200', message: 'success' }).end();
    } catch (error) {
        response.send((error instanceof Error) ? { status: '500', message: 'internal server error', error: error.message } : error).end();
    }
}
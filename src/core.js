const token_master = require('./utils/token-master');
const user_agent_parser = require('ua-parser-js');

function getResponse(obj, success, error) {
    const respObj = {
        success: true,
        data: {},
        error
    };

    if (success !== undefined && success === false)
        respObj.success = false;
    if (error)
        respObj.error = error;
    if (obj)
        respObj.data = obj;

    return respObj;
}

exports.getSuccessResponse = function (obj) {
    return getResponse(obj, true);
}

exports.getErrorResponse = function (error, obj) {
    return getResponse(obj, false, error);
}

// Auth
exports.verifyToken = function (req, res, next) {
    token_master.verifyJwtToken(req, res).then(user => {
        req.user = user;
        next();
    });
}

exports.getJwtToken = function (user, expiry) {
    return token_master.getJwtToken(user, expiry);
}

// Get Client IP

function getClientIp(req) {
    let ip = '';
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }
    return ip.split(",")[0];
}

// Parse User Agent

exports.parseUserAgent = function (req) {
    const parsedObj = user_agent_parser(req.headers['user-agent']);
    parsedObj['client_ip'] = getClientIp(req);
    return {
        ip: parsedObj.client_ip,
        browser: parsedObj.browser.name,
        browser_v: parsedObj.browser.version,
        os: parsedObj.os.name,
        os_v: parsedObj.os.version
    }
}
const token_master = require('./utils/token-master');
const user_agent_parser = require('ua-parser-js');
const bcrypt = require('bcrypt');

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
    return getResponse(obj, false, error.message || error);
}

// Auth
exports.verifyToken = function (req, res, next) {
    token_master.verifyJwtToken(req, user => {
            req.user = user;
            next();
        },
        (err) => res.status(403).json(this.getErrorResponse(err)));
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

exports.msToReadableDuration = (millisec) => {
    const seconds = (millisec / 1000).toFixed(1);
    const minutes = (millisec / (1000 * 60)).toFixed(1);
    const hours = (millisec / (1000 * 60 * 60)).toFixed(1);
    const days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) {
        return seconds + " Sec";
    } else if (minutes < 60) {
        return minutes + " Min";
    } else if (hours < 24) {
        return hours + " Hrs";
    } else {
        return days + " Days"
    }
}

exports.getPasswordHash = async (plain_password) => {
    return await bcrypt.hash(plain_password, 5);
}

exports.matchPassword = async (plain_password, hash) => {
    return await bcrypt.compare(plain_password, hash);
}

exports.authCheck = (req, res, next) => {
    token_master.verifyJwtToken(req, (user) => {
        req.user = user;
        next();
    }, (err) => {
        res.status(403).json(getErrorResponse(err));
    })
}
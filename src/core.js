const token_master = require('./utils/token-master');
const user_agent_parser = require('ua-parser-js');
const getShortNameRow = require('./db').getShortNameRow;
const StringConstants = {
    ME_URL: 'http://qlinks.in/'
}
exports.StringConstants = StringConstants;

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

// Random Ids
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charactersLength = characters.length;

function generateId(length) {
    length = length ? length : 1;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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

// Random Ids
exports.getShortIdValidated = async function (short_name, len = 3, unique = true) {
    const validShortName = (short_name && short_name.length > 0);
    const sanitizedLength = (Number.isInteger(parseInt(len)) && len >= 1) ? (len > 100 ? 100 : len) : 5;
    let maxAttempts = validShortName ? 1 : 50;
    while (maxAttempts-- >= 0) {
        const _short_name = validShortName ? short_name : generateId(sanitizedLength);
        // TODO check with temporary reservedList
        const row = await getShortNameRow(_short_name)
        if (row.length === 0) {
            return {
                short_name: _short_name,
                link: `/@${_short_name}`,
                url: `${StringConstants.ME_URL}@${_short_name}`,
                available: true
            };
        } else {
            if (maxAttempts === 0) {
                const rc = {...row[0]};
                return {
                    short_name: rc.short_name,
                    link: `/@${_short_name}`,
                    url: `${StringConstants.ME_URL}@${rc.short_name}`,
                    long_url: rc.long_url,
                    status: rc.status,
                    createdDt: rc.createdDt,
                    modifiedDt: rc.modifiedDt,
                    available: false
                };
            }
        }
    }
}
const jwt = require('jsonwebtoken');
const TOKEN_SECRET = process.env.TOKEN_SECRET || "security_on_web_is_overrated";

exports.getJwtToken = function (user, expiry) {
    return new Promise(function (resolve, reject) {
        expiry = expiry === undefined ? '24h' : expiry;
        const opts = {expiresIn: expiry};
        try {
            const accessToken = jwt.sign(user, TOKEN_SECRET, opts);
            jwt.verify(accessToken, TOKEN_SECRET, (err, user) => {
                if (user)
                    resolve({accessToken: accessToken, expireAt: user.exp * 1000});
                if (err)
                    reject(err);
            })
        } catch (error) {
            reject(error);
        }
    });
}

exports.verifyJwtToken = function (req, success, failure) {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(' ').length === 1 ? authHeader : authHeader.split(' ')[1];

    const ignoreExpiration = false;
    if (accessToken) {
        try {
            jwt.verify(accessToken, TOKEN_SECRET, {ignoreExpiration: ignoreExpiration}, (err, user) => {
                if (err) {
                    failure('Invalid authorization token');
                }
                success(user);
            });
        } catch (error) {
            failure(error);
        }
    } else {
        failure('Missing authorization token');
    }
}
const adminRouter = require('express').Router();
const db = require('../db');
const core = require('../core');
const Errors = require('../Errors');
const sendEmail = require("../utils/emailer").sendEmail;
const osutils = require("os-utils");
const getErrorResponse = core.getErrorResponse;
const getSuccessResponse = core.getSuccessResponse;
const getJwtToken = core.getJwtToken;

const multer = require('multer');
const mediaUtils = require('../utils/mediaUtils');
const upload = multer({storage: multer.memoryStorage()})

adminRouter.get('/health', (req, res) => {
    try {
        const data = {
            message: 'Connected!',
            totalMemory: osutils.totalmem().toFixed(2) + " MBs",
            freeMemory: osutils.freemem().toFixed(2) + " MBs",
            freeMemoryPercentage: osutils.freememPercentage().toFixed(2) + "%",
            sysUptime: core.msToReadableDuration(osutils.sysUptime()),
            averageLoad: osutils.loadavg(15)
        }

        osutils.cpuUsage(v => {
            data.cpuUsage = (100 * v).toFixed(2) + "%";
            res.status(200).json(data);
        })
    } catch (err) {
        res.status(500).send(err.stack)
    }
});

adminRouter.post('/login', (req, res) => {
    try {
        const username = req.body.username.toLowerCase();
        const password = req.body.password;

        if (!username || !password) {
            return res.status(400).json(getErrorResponse(Errors.MISSING_PARAMS_LOGIN));
        } else {
            if (username == "acemarket") {
                if (password == "AceMarket@201306") {
                    const admin = {
                        username: username,
                        name: "Admin",
                        type: "admin"
                    }
                    getJwtToken(
                        {admin}
                    ).then(tokenObj => {
                        return res.json(getSuccessResponse({
                            user: {...admin},
                            isAdmin: true,
                            ...tokenObj
                        }))
                    }, error => {
                        return res.status(500).json(getErrorResponse(error.message));
                    }).catch(error => {
                        return res.status(500).json(getErrorResponse(error.message));
                    });
                } else {
                    return res.status(401).json(getErrorResponse(Errors.INVALID_LOGIN_PASSWORD));
                }
            } else {
                return res.status(401).json(getErrorResponse(Errors.INVALID_LOGIN_USERNAME));
            }
        }
    } catch (err) {
        res.status(500).send(err.stack)
    }
});

adminRouter.post('/register/merchant', upload.single("logo_img"), async (req, res) => {
    try {
        // Sanitize input
        const mandatoryKeys = ["username", "password", "password_confirm", "email", "name", "fullname", "contact_no", "city", "state", "pin", "keys", "address_line_1"];
        const missingParams = [];
        for (let i = 0; i < mandatoryKeys.length; i++) {
            const key = mandatoryKeys[i];
            if (!req.body[key] || req.body[key].length === 0) {
                missingParams.push(key);
            }
        }

        if (missingParams.length > 0) {
            return res.json(getErrorResponse(`Missing mandatory params: ${missingParams}`));
        }
        if (req.body.password !== req.body.password_confirm) {
            return res.json(getErrorResponse("Password is not matching with confirm password field"));
        }

        const keys = req.body.keys.replace(/\s/g, '').toLowerCase().split(",").filter(item => item.length > 0);
        if (keys.length === 0) {
            return res.json(getErrorResponse("Keys cannot be empty. This helps in searching."));
        }

        const contact_no_others = req.body.contact_no_others.replace(/\s/g, '').split(",").filter(item => item.length > 0);

        const password = await core.getPasswordHash(req.body.password);

        const body = {
            username: req.body.username.toLowerCase(),
            email: req.body.email.toLowerCase(),
            name: req.body.name,
            fullname: req.body.fullname,
            contact_no: req.body.contact_no,
            contact_no_others: contact_no_others,
            keys: keys,
            address_line_1: req.body.address_line_1,
            address_line_2: req.body.address_line_2,
            address_line_3: req.body.address_line_3,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            pin: req.body.pin,
            password: password,
        }

        await mediaUtils.resizeAndUploadImage(req.file, (info) => {
            uploaded(info.filename);
        }, (err) => {
            res.json(getErrorResponse(err));
        })

        const uploaded = (filename) => {
            body.logo_img = filename;
            db.insertMerchant(body, (merchant) => {
                return res.json(getSuccessResponse(merchant));
            }, (err) => {
                db.deleteFile(filename);
                res.json(getErrorResponse(err));
            })
        }
    } catch (err) {
        res.status(500).send(err.stack)
    }
});

adminRouter.get('/experiment', async (req, res) => {
    res.json(getErrorResponse("Some error"));
});


//to
//subject
//body
adminRouter.get('/email', (req, res) => {
    try {
        const to = req.query['to'];
        const subject = req.query['subject'];
        const body = req.query['body'];
        const auth = req.query['auth'];
        const day = new Date().getDate();
        if (!!auth && Number.parseInt(auth) === (day * day))
            sendEmail(to, subject, body, (info) => {
                res.json(getSuccessResponse({info: info}));
            }, (error) => res.json(getErrorResponse(error)))
        else {
            res.json(getErrorResponse("[auth] failure. Error: Unauthorized. Code-DD#AY"));
        }
    } catch (err) {
        res.status(500).send(err.stack)
    }
});

module.exports = adminRouter;
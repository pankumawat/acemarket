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
    } catch (error) {
        res.status(500).json({error});
    }
});

adminRouter.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json(getErrorResponse(Errors.MISSING_PARAMS_LOGIN));
    } else {
        if (username == "admin") {
            if (password == "admin") {
                const admin = {
                    username: username,
                    name: "Admin Sahab",
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

    /*
    if (username && password) {
        db.getMerchantForLogin(username,
            (merchant) => {
                if (!merchant) {
                    return res.status(400).json(getErrorResponse(Errors.INVALID_LOGIN_USERNAME));
                } else {
                    const fetched_password = merchant.password;
                    const user = {
                        mid: merchant.mid,
                        username: merchant.username,
                        tag: merchant.tag,
                        name: merchant.name,
                        fullname: merchant.fullname,
                        email: merchant.email,
                        contact_no: merchant.contact_no,
                    }
                    if (true || fetched_password == password) {
                        getJwtToken(
                            {username: username, ...user}
                        ).then(tokenObj => {
                            const localUsrObj = {...user}
                            return res.json(getSuccessResponse({
                                user: {username: username, ...localUsrObj},
                                ...tokenObj
                            }))
                        }, error => {
                            console.log(error.stack)
                            return res.status(500).json(getErrorResponse(error.message));
                        });
                    } else {
                        return res.status(401).json(getErrorResponse(Errors.INVALID_LOGIN_PASSWORD));
                    }
                }
            }
            ,
            (error) => res.status(401).json(getErrorResponse(`Incorrect username or password ${error}`))
        )
        ;
    } else {
        return res.status(400).json({user: username, pass: password});
    }

     */

});

adminRouter.post('/register/merchant', upload.single("logo_img"), (req, res) => {
    mediaUtils.resizeAndUploadImage(req.file, (info) => {
        uploaded(info.filename);
    }, (err) => {
        res.json(getErrorResponse(err));
    })

    const uploaded = (filename) => {
        const body = {
            ...req.body,
            logo_img: filename
        }

        body.keys = body.keys.replace(/\s/g, '').split(",").filter(item => item.length > 0);
        body.contact_no_others = body.contact_no_others.replace(/\s/g, '').split(",").filter(item => item.length > 0);

        res.json(getSuccessResponse(body));
    }
});


//to
//subject
//body
adminRouter.get('/email', (req, res) => {
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
});

module.exports = adminRouter;
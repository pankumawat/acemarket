const adminRouter = require('express').Router();
const db = require('../db');
const core = require('../core');
const Errors = require('../Errors');
const sendEmail = require("../utils/emailer").sendEmail;
const osutils = require("os-utils");

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
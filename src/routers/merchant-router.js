const merchantRouter = require('express').Router();
const db = require('../db');
const core = require('../core');
const tokenMaster = require('../utils/token-master');

const Errors = require('../Errors');
const getJwtToken = core.getJwtToken;
const verifyJwtToken = tokenMaster.verifyJwtToken;

const getErrorResponse = core.getErrorResponse;
const getSuccessResponse = core.getSuccessResponse;

const multer = require('multer');
const mediaUtils = require('../utils/mediaUtils');
const upload = multer({storage: multer.memoryStorage()})

merchantRouter.post('/register/product', upload.single("logo_img"), async (req, res) => {

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
});

merchantRouter.post('/login/status', (req, res) => {
    const access_token = req.body.access_token;
    const username = req.body.username;
    if (access_token && username) {
        req.headers.authorization = access_token;
        verifyJwtToken(req, (user) => {
            return res.json(getSuccessResponse(user));
        }, (err) => {
            return res.status(400).json(getErrorResponse(err));
        });
    } else {
        return res.status(400).json(getErrorResponse("access_token and username are required params."));
    }
});

merchantRouter.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        db.getMerchantForLogin(username,
            async (merchant) => {
                if (!merchant) {
                    return res.status(400).json(getErrorResponse(Errors.INVALID_LOGIN_USERNAME));
                } else {
                    const user = {
                        mid: merchant.mid,
                        username: merchant.username,
                        name: merchant.name,
                        fullname: merchant.fullname,
                        email: merchant.email,
                        contact_no: merchant.contact_no,
                        type: "merchant"
                    }
                    if (await core.matchPassword(password, merchant.password)) {
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

merchantRouter.get('/:mid', (req, res) => {
    const mid = req.params['mid'];
    db.getMerchant(mid, (data) => res.json(core.getSuccessResponse(data)), (err) => res.json(core.getErrorResponse(err)));
});

//mid=0, 1, or 0_1_2
merchantRouter.get('/multi/:mids', (req, res) => {
    const mids = req.params['mids'];
    db.getMerchantsMulti(mids.split('_'), (items) => res.json(core.getSuccessResponse(items))
        , (err) => res.json(core.getErrorResponse(err)));
});

merchantRouter.get('/:mid/ps', (req, res) => {
    const mid = req.params['mid'];
    db.getMerchantProducts(mid, (data) => {
        const _data = data.map(item => {
            item['rating_number'] = db.getRating(item.rating);
            return item;
        });
        res.json(core.getSuccessResponse(_data));
    }, (err) => res.json(core.getErrorResponse(err)));
});

module.exports = merchantRouter;
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

// const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
// req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
merchantRouter.post('/register/product', core.authCheck, upload.fields([{name: 'img', maxCount: 1}, {
    name: 'imgs',
    maxCount: 15
}]), async (req, res) => {
    // Sanitize input
    if (req.user.username !== req.headers.authorization.split(' ')[0]) {
        return res.status(403).json(this.getErrorResponse("Unauthorized."))
    }
    console.dir(req.body);
    const mandatoryKeys = ["name", "description", "keys", "price"];
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

    const keys = req.body.keys.replace(/\s/g, '').toLowerCase().split(",").filter(item => item.length > 0);
    if (keys.length === 0) {
        return res.json(getErrorResponse("Keys cannot be empty. This helps in searching."));
    }
    console.log(`req.body.properties_name ${typeof req.body.properties_name}`);
    const properties_name = typeof req.body.properties_name === 'string' ? [req.body.properties_name] : req.body.properties_name;
    const properties_value = typeof req.body.properties_value === 'string' ? [req.body.properties_value] : req.body.properties_value;
    const properties = {};
    for (let i = 0; i < properties_name.length; i++) {
        const key = properties_name[i].trim();
        const value = properties_value[i].trim();
        if (key.length > 0 && value.length > 0) {
            properties[key] = value;
        }
    }
    const body = {
        name: req.body.name.trim(),
        description: req.body.description.trim(),
        keys: keys,
        price: Number.parseInt(req.body.price),
        price_without_discount: (req.body.price_without_discount && Number.parseInt(req.body.price_without_discount)),
        mid: req.user.mid,
        img: undefined,
        properties,
        imgs: [],
        addedDt: Date.now(),
        modifiedDt: Date.now(),
        rating: {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0
        },
        sold_units: 0
    }

    await mediaUtils.resizeAndUploadImage(req.files["img"][0], async (info) => {
        body.img = info.filename;

        if (!!req.files["imgs"]) {
            for (let i = 0; i < req.files["imgs"].length; i++) {
                await mediaUtils.resizeAndUploadImage(req.files["imgs"][i], (info) => {
                    body.imgs.push(info.filename);
                    if (i === (req.files["imgs"].length - 1)) {
                        uploaded();
                    }
                }, (err) => {
                    if (i === (req.files["imgs"].length - 1)) {
                        uploaded();
                    }
                })
            }
        }
    }, (err) => {
        return res.json(getErrorResponse(err));
    })

    const uploaded = () => {
        return res.json(body);
        /*        db.insertProduct(body, (merchant) => {
                    return res.json(getSuccessResponse(merchant));
                }, (err) => {
                    db.deleteFile(filename);
                    res.json(getErrorResponse(err));
                }) */
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
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

merchantRouter.post('/product',
    core.authCheck,
    upload.fields([
            {
                name: 'img', maxCount: 1
            }, {
                name: 'imgs',
                maxCount: 15
            }
        ]
    ), async (req, res) => {
        try {
            const pid = (!!req.body.pid && String(Number(req.body.pid)) === req.body.pid) ? Number.parseInt(req.body.pid) : undefined;
            const isNew = !pid;

            // Sanitize input
            if (req.user.username !== req.headers.authorization.split(' ')[0]) {
                return res.status(403).json(this.getErrorResponse("Unauthorized."))
            }
            if (isNew) {
                const mandatoryKeys = ["name", "description", "keys"];
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
            }

            const keys = req.body.keys.replace(/\s/g, '').toLowerCase().split(",").filter(item => item.length > 0);
            if (keys.length === 0) {
                if (isNew)
                    return res.json(getErrorResponse("Keys cannot be empty. This helps in searching."));
            }

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

            const getFilteredVal = (val) => {
                if (!!val) {
                    switch (typeof val) {
                        case "string":
                            return val.trim().length > 0 ? val.trim() : undefined;
                        case "number":
                            return val;
                        case "object": {
                            if (Array.isArray(val) && val.length > 0)
                                return val;
                            else if (val.size > 0)
                                return val;
                            else
                                return undefined;
                        }
                        default:
                            return undefined;
                    }
                } else {
                    return undefined;
                }
            }

            const body = {
                pid: pid,
                name: getFilteredVal(req.body.name),
                description: getFilteredVal(req.body.description),
                keys: getFilteredVal(keys),
                price: ((!!req.body.price && req.body.price > 0) ? Number.parseInt(req.body.price) : 0),
                price_without_discount: ((!!req.body.price && !!req.body.price_without_discount && req.body.price_without_discount > req.body.price) ? Number.parseInt(req.body.price_without_discount) : 0),
                mid: req.user.mid,
                img: undefined,
                properties: getFilteredVal(properties),
                imgs: undefined,
                addedDt: isNew ? Date.now() : undefined,
                modifiedDt: Date.now(),
                rating: isNew ? {
                    "1": 0,
                    "2": 0,
                    "3": 0,
                    "4": 0
                } : undefined,
                sold_units: isNew ? 0 : undefined
            }

            const uploadOtherImages = async () => {
                if (!!req.files["imgs"]) {
                    body.imgs = [];
                    for (let i = 0; i < req.files["imgs"].length; i++) {
                        await mediaUtils.resizeAndUploadImage(req.files["imgs"][i], (info) => {
                            body.imgs.push(info.filename);
                            filesToBeDeleted.push(info.filename);
                            if (i === (req.files["imgs"].length - 1)) {
                                uploaded();
                            }
                        }, (err) => {
                            if (i === (req.files["imgs"].length - 1)) {
                                uploaded();
                            }
                        })
                    }
                } else {
                    uploaded();
                }
            }

            const uploaded = () => {
                if (isNew)
                    db.insertProduct(body, (product) => {
                        return res.json(getSuccessResponse(product));
                    }, (err) => {
                        return abort(err);
                    })
                else {
                    Object.keys(body).forEach(key => {
                        if (body[key] === undefined)
                            delete body[key];
                    })
                    if (!!body.img || !!body.imgs) {
                        db.getProduct(pid, (existingBody) => {
                            if (!!body.img) {
                                filesToBeDeleted.push(existingBody.img);
                            }
                            if (!!body.imgs && body.imgs.length > 0) {
                                filesToBeDeleted.push(...existingBody.imgs);
                            }
                            updateExistingProduct();
                        }, (err) => {
                            return abort(err);
                        })
                    } else {
                        updateExistingProduct();
                    }
                }
            }

            const updateExistingProduct = () => {
                db.updateProduct(body, (product) => {
                    return res.json(getSuccessResponse(product));
                }, (err) => {
                    console.log(`Failed so deleting files. ${JSON.stringify(filesToBeDeleted)}`)
                    return res.json(getErrorResponse(error));
                })
            }

            const abort = (error) => {
                db.deleteFiles(filesToBeDeleted, (done) => {
                    console.log(`Failed so deleting files. ${JSON.stringify(filesToBeDeleted)}`)
                })
                return res.json(getErrorResponse(error));
            }

            const filesToBeDeleted = [];
            if (isNew || (!!req.files["img"] && req.files["img"].length > 0)) {
                await mediaUtils.resizeAndUploadImage(req.files["img"][0], async (info) => {
                    body.img = info.filename;
                    filesToBeDeleted.push(info.filename);
                    await uploadOtherImages();
                }, (err) => {
                    return abort(err);
                })
            } else {
                await uploadOtherImages();
            }
        } catch (err) {
            res.status(500).send(err.stack)
        }
    });

merchantRouter.post('/login/status', (req, res) => {
    try {
        const access_token = req.body.access_token;
        const username = req.body.username.toLowerCase();
        ;
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
    } catch (err) {
        res.status(500).send(err.stack)
    }
});

merchantRouter.post('/login', (req, res) => {
    try {
        const username = req.body.username.toLowerCase();
        ;
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
    } catch (err) {
        res.status(500).send(err.stack)
    }
});

merchantRouter.get('/:mid', (req, res) => {
    try {
        const mid = req.params['mid'];
        db.getMerchant(mid, (data) => res.json(core.getSuccessResponse(data)), (err) => res.json(core.getErrorResponse(err)));
    } catch (err) {
        res.status(500).send(err.stack)
    }
});

//mid=0, 1, or 0_1_2
merchantRouter.get('/multi/:mids', (req, res) => {
    try {
        const mids = req.params['mids'];
        db.getMerchantsMulti(mids.split('_'), (items) => res.json(core.getSuccessResponse(items))
            , (err) => res.json(core.getErrorResponse(err)));
    } catch (err) {
        res.status(500).send(err.stack)
    }
});

merchantRouter.get('/:mid/ps', (req, res) => {
    try {
        const mid = req.params['mid'];
        db.getMerchantProducts(mid, (data) => {
            const _data = data.map(item => {
                item['rating_number'] = db.getRating(item.rating);
                return item;
            });
            res.json(core.getSuccessResponse(_data));
        }, (err) => res.json(core.getErrorResponse(err)));
    } catch (err) {
        res.status(500).send(err.stack)
    }
});

module.exports = merchantRouter;
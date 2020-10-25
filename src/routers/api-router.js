const apiRoute = require('express').Router();
const imageRoute = require('./image-router');
const adminRoute = require('./admin-router');
const db = require('../db');
const core = require('../core');
const Errors = require('../Errors');

// Functions
const getSuccessResponse = core.getSuccessResponse;
const getErrorResponse = core.getErrorResponse;
const getJwtToken = core.getJwtToken;

apiRoute.get('/login/status', (req, res) => {
    const access_token = req.body.access_token;
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

apiRoute.post('/login', (req, res) => {
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

apiRoute.get('/merchant/:mid', (req, res) => {
    const mid = req.params['mid'];
    db.getMerchant(mid, (data) => res.json(core.getSuccessResponse(data)), (err) => res.json(core.getErrorResponse(err)));
});

//mid=0, 1, or 0_1_2
apiRoute.get('/merchants/:mids', (req, res) => {
    const mids = req.params['mids'];
    db.getMerchantsMulti(mids.split('_'), (items) => res.json(core.getSuccessResponse(items))
        , (err) => res.json(core.getErrorResponse(err)));
});

apiRoute.get('/merchant/:mid/products', (req, res) => {
    const mid = req.params['mid'];
    db.getMerchantProducts(mid, (data) => {
        const _data = data.map(item => {
            item['rating_number'] = db.getRating(item.rating);
            return item;
        });
        res.json(core.getSuccessResponse(_data));
    }, (err) => res.json(core.getErrorResponse(err)));
});

apiRoute.get('/product/:pid', (req, res) => {
    const pid = req.params['pid'];
    db.getProduct(pid, (item) => {
        item['rating_number'] = db.getRating(item.rating);
        res.json(core.getSuccessResponse(item));
    }, (err) => res.json(core.getErrorResponse(err)));
});

//pids=100_101_209 or 101
apiRoute.get('/products/:pids', (req, res) => {
    const ids = req.params['ids'];
    db.getProductsMulti(ids.split('_'), (items) => {
        const _items = items.map(item => {
            item['rating_number'] = db.getRating(item.rating);
            return item;
        })
        res.json(core.getSuccessResponse(_items));
    }, (err) => res.json(core.getErrorResponse(err)));
});

//pids=100_101_209 or 101
//mids=0_1 or 1
apiRoute.get('/data/cart', (req, res) => {
    const pids = req.query['pids'];
    const mids = req.query['mids'];
    if (!pids || !mids) {
        res.json(core.getErrorResponse("pids and mids are mandatory query params."))
    } else {
        db.getProductsMulti(pids.split('_'), (products) => {
            const _products = products.map(product => {
                product['rating_number'] = db.getRating(product.rating);
                delete product['imgs']
                delete product['properties']
                delete product['rating']
                delete product['sold_units']
                delete product['_id'];
                return product;
            })

            db.getMerchantsMulti(mids.split('_'), (merchants) => {
                const _merchants = merchants.map(merchant => {
                    delete merchant["_id"];
                    delete merchant['username'];
                    delete merchant['address'];
                    delete merchant['keys'];
                    delete merchant['banner_img'];
                    delete merchant['background_img'];
                    return merchant;
                })
                const productsMap = {};
                const merchantsMap = {};
                _products.forEach(product => productsMap[product.pid] = product);
                _merchants.forEach(merchant => merchantsMap[merchant.mid] = merchant);
                res.json(core.getSuccessResponse({products: productsMap, merchants: merchantsMap}));
            }, (err) => res.json(core.getErrorResponse(err)))
        }, (err) => res.json(core.getErrorResponse(err)));
    }
})

/*
 * price_range e.g. 100_1200
 * search_strings e.g. chocolate_pastry_juice
 * rating_minimum e.g.
 * recommended
 */
apiRoute.get('/search', (req, res) => {
    let queryObj = {};
    Object.keys(req.query).forEach(key => {
        queryObj[key] = (typeof req.query[key] !== 'object') ? req.query[key] : req.query[key][0];
    })
    db.getProducts((data) => {
        const _data = data.map(item => {
            item['rating_number'] = db.getRating(item.rating);
            return item;
        });
        res.json(core.getSuccessResponse(_data));
    }, (err) => res.json(core.getErrorResponse(err)), queryObj);
});

apiRoute.use("/images/", imageRoute);
apiRoute.use("/admin/", adminRoute);

module.exports = apiRoute;
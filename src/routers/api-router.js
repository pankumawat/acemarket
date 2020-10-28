const apiRoute = require('express').Router();
const imageRoute = require('./image-router');
const adminRoute = require('./admin-router');
const merchantRouter = require('./merchant-router');

const tokenMaster = require('../utils/token-master');
const db = require('../db');
const core = require('../core');

apiRoute.get('/p/:pid', (req, res) => {
    try {
        const pid = req.params['pid'];
        db.getProduct(pid, (item) => {
            if (item)
                item['rating_number'] = db.getRating(item.rating);
            res.json(core.getSuccessResponse(item));
        }, (err) => res.json(core.getErrorResponse(err)));
    } catch (err) {
        res.status(500).end(err)
    }
});

//pids=100_101_209 or 101
apiRoute.get('/ps/:pids', (req, res) => {
    try {
        const ids = req.params['ids'];
        db.getProductsMulti(ids.split('_'), (items) => {
            const _items = items.map(item => {
                item['rating_number'] = db.getRating(item.rating);
                return item;
            })
            res.json(core.getSuccessResponse(_items));
        }, (err) => res.json(core.getErrorResponse(err)));
    } catch (err) {
        res.status(500).end(err)
    }
});

//pids=100_101_209 or 101
//mids=0_1 or 1
apiRoute.get('/data/cart', (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).end(err)
    }
})

/*
 * price_range e.g. 100_1200
 * search_strings e.g. chocolate_pastry_juice
 * rating_minimum e.g.
 * recommended
 * limit = number or records
 */
apiRoute.get('/search', (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).end(err)
    }
});

apiRoute.use("/m/", merchantRouter); // merchant
apiRoute.use("/i/", imageRoute); // images
apiRoute.use("/a/", adminRoute); // admin

module.exports = apiRoute;
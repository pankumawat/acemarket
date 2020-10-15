const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const path = require('path');
const db = require('./src/db');

const core = require('./src/core');

const apiRoute = require('./src/api-router');
const app = express();
const port = process.env.PORT;

app.use(express.static('public'));
app.use(express.json());

app.get('/@:short_name', (req, res) => {
    const short_name = req.params['short_name'];
    core.getShortIdValidated(short_name).then(data => {
        res.redirect(data.long_url);
    })
});

app.get('/api/merchant/:mid', (req, res) => {
    const mid = req.params['mid'];
    db.getMerchant(mid, (data) => {
        const _data = {...data};
        delete _data["password"];
        res.json(core.getSuccessResponse(_data))
    }, (err) => res.json(core.getErrorResponse(err)));
});

//mid=0, 1, or 0_1_2
app.get('/api/merchants/:mids', (req, res) => {
    const mids = req.params['mids'];
    db.getMerchantsMulti(mids.split('_'), (items) => {
        const _items = items.map(item => {
            delete item["password"];
            delete item["email"];
            return item;
        })
        res.json(core.getSuccessResponse(_items));
    }, (err) => res.json(core.getErrorResponse(err)));
});

app.get('/api/merchant/:mid/products', (req, res) => {
    const mid = req.params['mid'];
    db.getMerchantProducts(mid, (data) => {
        const _data = data.map(item => {
            item['rating_number'] = db.getRating(item.rating);
            return item;
        });
        res.json(core.getSuccessResponse(_data));
    }, (err) => res.json(core.getErrorResponse(err)));
});

app.get('/api/product/:id', (req, res) => {
    const id = req.params['id'];
    db.getProduct(id, (item) => {
        item['rating_number'] = db.getRating(item.rating);
        res.json(core.getSuccessResponse(item));
    }, (err) => res.json(core.getErrorResponse(err)));
});

//id=100_101_209 or 101
app.get('/api/products/:ids', (req, res) => {
    const ids = req.params['ids'];
    db.getProductsMulti(ids.split('_'), (items) => {
        const _items = items.map(item => {
            item['rating_number'] = db.getRating(item.rating);
            return item;
        })
        res.json(core.getSuccessResponse(_items));
    }, (err) => res.json(core.getErrorResponse(err)));
});

//ids=100_101_209 or 101
//mids=0_1 or 1
app.get('/api/data/cart', (req, res) => {
    const ids = req.query['ids'];
    const mids = req.query['mids'];
    if (!ids || !mids) {
        res.json(core.getErrorResponse("ids and mids are mandatory query params."))
    } else {
        db.getProductsMulti(ids.split('_'), (products) => {
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
                    delete merchant["password"];
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
                _products.forEach(product => productsMap[product.id] = product);
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
app.get('/api/search', (req, res) => {
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

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get(['/home', '/details', '/login', '/search', '/cart'], (req, res) => {
    console.log(`GET ${req.url}`);
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.use((req, res) => {
    const queryObj = req.query;
    let queryString = '';
    Object.keys(queryObj).forEach(key => {
        queryString = `${queryString}${queryString.length === 0 ? '?' : '&'}${key}=${queryObj[key]}`
    })
    res.redirect('/');
});

/******************************/
app.listen(port, () => {
    console.log(`acemarket running on ${port}!`)
});

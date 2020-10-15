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
    let short_name = req.params['short_name'];
    core.getShortIdValidated(short_name).then(data => {
        res.redirect(data.long_url);
    })
});

app.get('/api/merchant/:mid', (req, res) => {
    let mid = req.params['mid'];
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
    let mid = req.params['mid'];
    db.getMerchantProducts(mid, (data) => {
        const _data = data.map(item => {
            item['rating_number'] = db.getRating(item.rating);
            return item;
        });
        res.json(core.getSuccessResponse(_data));
    }, (err) => res.json(core.getErrorResponse(err)));
});

app.get('/api/product/:id', (req, res) => {
    let id = req.params['id'];
    db.getProduct(id, (item) => {
        item['rating_number'] = db.getRating(item.rating);
        res.json(core.getSuccessResponse(item));
    }, (err) => res.json(core.getErrorResponse(err)));
});

//id=100_101_209 or 101
app.get('/api/products/:ids', (req, res) => {
    let ids = req.params['ids'];
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
app.get('/api/products', (req, res) => {
    let ids = req.params['ids'];
    db.getProductsMulti(ids.split('_'), (items) => {
        const _items = items.map(item => {
            item['rating_number'] = db.getRating(item.rating);
            return item;
        })
        res.json(core.getSuccessResponse(_items));
    }, (err) => res.json(core.getErrorResponse(err)));
});

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

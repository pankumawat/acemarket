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

app.get(['/', '/login', '/home', '/logout', '/fe/*'], (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/@:short_name', (req, res) => {
    let short_name = req.params['short_name'];
    core.getShortIdValidated(short_name).then(data => {
        res.redirect(data.long_url);
    })
});

app.get('/merchant/:mid', (req, res) => {
    let mid = req.params['mid'];
    db.getMerchant(mid, (data) => res.send(data), (err) => res.send(err));
});

app.get('/merchant/:mid/products', (req, res) => {
    let mid = req.params['mid'];
    db.getMerchantProducts(mid, (data) => {
        data.map(item => {
            item['rating_number'] = db.getRating(item.rating);
            return item;
        });
        res.send(data);
    }, (err) => res.send(err));
});

app.get('/products/:id', (req, res) => {
    let id = req.params['id'];
    db.getProduct(id, (item) => {
        item['rating_number'] = db.getRating(item.rating);
        res.send(item)
    }, (err) => res.send(err));
});

/*
 * price_range e.g. 100_1200
 * string_keys e.g. chocolate_pastry_juice
 * rating_minimum e.g.
 */
app.get('/products', (req, res) => {
    let queryObj = {};
    Object.keys(req.query).forEach(key => {
        queryObj[key] = (typeof req.query[key] !== 'object') ? req.query[key] : req.query[key][0];
    })
    db.getProducts((data) => {
        data.map(item => {
            item['rating_number'] = db.getRating(item.rating);
            return item;
        });
        res.send(data);
    }, (err) => res.send(err), queryObj);
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

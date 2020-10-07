// loads .env property file.
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');

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
    core.getShortIdValidated(short_name).then(data=> {
        res.redirect(data.long_url);
    })
});

app.use('/api', apiRoute);

app.get(['/', '/login', '/home', '/logout', '/fe/*'], (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.use((req, res) => {
    const queryObj = req.query;
    let queryString = '';
    Object.keys(queryObj).forEach(key => {
        queryString = `${queryString}${queryString.length === 0 ? '?' : '&' }${key}=${queryObj[key]}`
    })
    res.redirect('/');
});

/******************************/
app.listen(port, () => {
    console.log(`qlinks running on ${port}!`)
});

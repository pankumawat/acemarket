const express = require('express');
const path = require('path');
const core = require('./src/core');
const apiRoute = require('./src/routers/api-router');
const app = express();

app.use(express.static('public', {
    dotfiles: 'allow'
}));

app.use(express.json());
app.use('/api/', apiRoute);

app.get('/@:short_name', (req, res) => {
    const short_name = req.params['short_name'];
    core.getShortIdValidated(short_name).then(data => {
        res.redirect(data.long_url);
    })
});

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get(['/home', '/details', '/login', '/search', '/cart', '/adminlogin'], (req, res) => {
    if (process.env.APPENV == "local")
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
if (process.env.APPENV == "local")
    app.listen(process.env.PORT || 3001, () => {
        console.log(`acemarket running on local ${process.env.PORT || 3001}!`)
    });

module.exports = app;

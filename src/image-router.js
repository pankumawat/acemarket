const imageRoute = require('express').Router();
const core = require('./core');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');

// Functions
const getSuccessResponse = core.getSuccessResponse;
const getErrorResponse = core.getErrorResponse;
const getJwtToken = core.getJwtToken;

imageRoute.use('/profile', function (req, res, next) {
    console.log('Request Type:', req.method)
    next();
})


/*imageRoute.post('/product', uploadProfile.single('productImg'), function (req, res, next) {
    const {file} = req;
    const stream = fs.createReadStream(file.path);
    storage.fromStream(stream, req, file)
        .then(() => res.send('File uploaded'))
        .catch(() => res.status(500).send('error'));
});*/

module.exports = imageRoute;
const imageRoute = require('express').Router();
const core = require('./core');
const db = require('./db');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const upload = multer({storage: multer.memoryStorage()})

const imgMimes = [
    'image/bmp',
    'image/gif',
    'image/x-icon',
    'image/jpeg',
    'image/png',
    'image/svg+xml'
]

// Functions
const getSuccessResponse = core.getSuccessResponse;
const getErrorResponse = core.getErrorResponse;
const getJwtToken = core.getJwtToken;

const uploadMW = require('./uploadMW');
const imgMap = {}

imageRoute.post('/profile', uploadMW.uploadImages, uploadMW.resizeImages, uploadMW.getResult, async function (req, res, next) {
    res.json([...Object.keys(req.body)]);
});

imageRoute.get('/profile/:filename', function (req, res, next) {
    const filename = req.params["filename"];
    db.readFile(filename,
        (stream) => {
            stream.pipe(res);
        }
    );
});

module.exports = imageRoute;
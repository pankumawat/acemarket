const imageRoute = require('express').Router();
const core = require('../core');
const db = require('../db');
const multer = require('multer');
const mediaUtils = require('../utils/mediaUtils');
const upload = multer({storage: multer.memoryStorage()})

// Functions
const getSuccessResponse = core.getSuccessResponse;
const getErrorResponse = core.getErrorResponse;

imageRoute.get('/:filename', function (req, res, next) {
    try {
        const filename = req.params["filename"];
        db.readFile(filename,
            (stream) => {
                stream.pipe(res);
            }, (error) => {
                res.status(404).json(getErrorResponse("No such file exists."))
            }
        );
    } catch (err) {
        res.status(500).end(err)
    }
});

imageRoute.delete('/:filename', function (req, res, next) {
    try {
        const filename = req.params["filename"];
        db.deleteFile(filename, obj => {
            res.json(obj);
        })
    } catch (err) {
        res.status(500).end(err)
    }
});

module.exports = imageRoute;
const imageRoute = require('express').Router();
const core = require('../core');
const db = require('../db');
const multer = require('multer');
const mediaUtils = require('../utils/mediaUtils');
const upload = multer({storage: multer.memoryStorage()})

// Functions
const getSuccessResponse = core.getSuccessResponse;
const getErrorResponse = core.getErrorResponse;

// for actuals..
// const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
// req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
imageRoute.post('/profile', upload.single("image"), function (req, res, next) {
    if (req.body.upload == "yes")
        mediaUtils.resizeAndUploadImage(req.file, (info) => {
            res.json(getSuccessResponse(info));
        }, (err) => {
            res.json(getErrorResponse(err));
        })
    else
        res.json(getErrorResponse("You yourself did not want the upload to happen."));
});

imageRoute.get('/:filename', function (req, res, next) {
    const filename = req.params["filename"];
    db.readFile(filename,
        (stream) => {
            stream.pipe(res);
        }, (error) => {
        res.status(404).json(getErrorResponse("No such file exists."))
        }
    );
});

imageRoute.delete('/:filename', function (req, res, next) {
    const filename = req.params["filename"];
    db.deleteFile(filename, obj => {
        res.json(obj);
    })
});

module.exports = imageRoute;
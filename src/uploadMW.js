const multer = require("multer");
const sharp = require("sharp");
const crypto = require('crypto');
const path = require("path");
const db = require('./db');
const fs = require('fs');
const GridFsStorage = require('multer-gridfs-storage');
const multerStorage = multer.memoryStorage();
const GridStore = require('mongodb').GridStore;


const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb("Please upload only images.", false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const uploadFiles = upload.array("image");

const uploadImages = (req, res, next) => {
    uploadFiles(req, res, err => {
        if (err instanceof multer.MulterError) {
            if (err.code === err.code) {
                return res.send(`Too many files to upload. ${err.code}`);
            }
        } else if (err) {
            return res.send(err);
        }
        next();
    });
};

const resizeImages = async (req, res, next) => {
    if (!req.files) return next();
    req.body.images = [];
        req.files.map(async file => {
            const newFilename = (await crypto.randomBytes(20)).toString('hex') + ".jpeg";
            req.body.imagesBuffer = [];
            console.log()
                sharp(file.buffer)
                    .resize({
                        height: 480,
                        fit: sharp.fit.cover,
                        position: sharp.strategy.entropy,
                        withoutEnlargement: true
                    })
                    .toFormat('jpeg')
                    .jpeg({quality: 90})
                    .toBuffer().then(async (buffer) => {
                        const fullBuffer = await buffer;
                        db.saveFile(fullBuffer, newFilename, (info) => {
                        return res.json(info);
                    });
                });


            /*
                            .toFile(newFilename, (err, info) => {
                                if(err)
                                    console.err(err);
                                else
                                    console.info(info);

                            });
            */


            req.body.images.push(newFilename);


        }
    );
    //next();
};

const getResult = async (req, res) => {
    if (req.body.images.length <= 0) {
        return res.send(`You must select at least 1 image.`);
    }

    const images = req.body.images
        .map(image => "" + image + "")
        .join("");

    return res.send(`Images were uploaded:${images}`);
};

module.exports = {
    uploadImages: uploadImages,
    resizeImages: resizeImages,
    getResult: getResult
};
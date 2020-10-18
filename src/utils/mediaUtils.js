const sharp = require("sharp");
const crypto = require('crypto');
const db = require('../db');

exports.resizeAndUploadImage = async (file, success, failure, height) => {
    if (!file.mimetype.startsWith("image"))
        return failure(`Only images are allowed. Uploaded type: ${file.mimetype}`);
    const filename = (await crypto.randomBytes(20)).toString('hex') + ".jpeg";
    sharp(file.buffer)
        .resize({
            height: height || 480,
            fit: sharp.fit.cover,
            position: sharp.strategy.entropy,
            withoutEnlargement: true
        })
        .jpeg({quality: 90})
        .toBuffer().then(async (buffer) => {
        db.saveFile(await buffer, filename, (info) => {
            return success(info);
        });
    });
}
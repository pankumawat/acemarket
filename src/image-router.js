const imageRoute = require('express').Router();
const core = require('./core');
const crypto = require('crypto');
const path = require('path');
const GridFsStorage = require('multer-gridfs-storage');
const mongo = require('mongodb');
const Grid = require('gridfs-stream');
const multer = require('multer');

const getGridFsStorage = (bucket) => new GridFsStorage({
    url: 'mongodb://localhost:27017/acemarket', options: {useUnifiedTopology: true},
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const mime = file.mimetype;
                const mimeMatch = [
                    'image/bmp',
                    'image/gif',
                    'image/x-icon',
                    'image/jpeg',
                    'image/png',
                    'image/svg+xml'
                ].filter(item => item == mime).length === 1;
                if (!mimeMatch)
                    reject('Only image files are allowed.');
                else {
                    const fileInfo = {
                        filename: filename,
                        bucketName: bucket,
                    };
                    resolve(fileInfo);
                }
            });
        });
    }
});
const storageProfiles = getGridFsStorage('/images/profile');
const storageProducts = getGridFsStorage('/images/products');


const db = new mongo.Db('acemarket', new mongo.Server("127.0.0.1", 27017));
const gfsProfile = new mongo.GridFSBucket(db, {
    bucketName: '/images/profile'
});

const gfsProduct = new mongo.GridFSBucket(db, {
    bucketName: '/images/products'
});

const uploadProfiles = multer({storage: storageProfiles});
const uploadProducts = multer({storage: storageProfiles});

// Functions
const getSuccessResponse = core.getSuccessResponse;
const getErrorResponse = core.getErrorResponse;
const getJwtToken = core.getJwtToken;

imageRoute.use('/profile', function (req, res, next) {
    console.log('Request Type:', req.method)
    next();
})

imageRoute.post('/profile', uploadProfiles.single('image'), function (req, res, next) {
    req.file.size = `${Math.round(req.file.size / 1000)} Kbs`;
    res.send(req.file);
});

imageRoute.get('/profile/:filename', function (req, res, next) {
    gfsProfile.openDownloadStreamByName(req.params.filename).pipe(res);
    // gfsProfile.downloadToStream(req.params.filename,res);
});

/*imageRoute.post('/product', uploadProfile.single('productImg'), function (req, res, next) {
    const {file} = req;
    const stream = fs.createReadStream(file.path);
    storage.fromStream(stream, req, file)
        .then(() => res.send('File uploaded'))
        .catch(() => res.status(500).send('error'));
});*/

module.exports = imageRoute;
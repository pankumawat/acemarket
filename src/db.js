const MongoClient = require('mongodb').MongoClient;
const GridFSBucket = require('mongodb').GridFSBucket;
const crypto = require('crypto');
const Errors = require('./Errors');

const COLLECTIONS = {
    MERCHANT: "merchant",
    PRODUCTS: "products",
    ADMIN: "admins",
}

const mongoConnURI = 'mongodb://127.0.0.1:27017/acemarket';
const getMongoClient = () => {
    return new MongoClient(
        mongoConnURI,
        {useUnifiedTopology: true},
        {useNewUrlParser: true},
        {connectTimeoutMS: 3000},
        {keepAlive: 1}
    );
}

// FILES
exports.saveFile = async (buffer, filename, successCB, failureCB) => {
    if (!successCB)
        throw new Error("success callback can't be undefined.");
    const client = getMongoClient();

    await client.connect();
    const gsUploadStream = new GridFSBucket(client.db()).openUploadStream(filename, {
        contentType: "image/jpeg"
    })
    gsUploadStream.on("finish", (info) => {
        successCB(info);
        client.close();
    });
    gsUploadStream.on("error",
        (error) => {
            if (!!failureCB) {
                failureCB(error);
            }
            client.close();
        }
    )
    gsUploadStream.end(buffer);
}

let getImagesClient = getMongoClient();
getImagesClient.connect();
exports.readFile = (filename, success, failure, retryCount) => {
    if (!getImagesClient.isConnected()) {
        console.log(`MONGO RECONNECTING FOR IMAGES..`)
        getImagesClient = getMongoClient();
        getImagesClient.connect();
        if (retryCount === 1) {
            return failure("Please try again. Facing database connectivity issue.");
        } else {
            readFile(filename, success, failure, !!retryCount ? (retryCount - 1) : 10);
        }
    } else {
        const gsDownloadStream = new GridFSBucket(getImagesClient.db()).openDownloadStreamByName(filename)
        gsDownloadStream.on('error', failure)
        success(gsDownloadStream);
    }
}

exports.findFiles = async (filenames, successCB) => {
    const client = this.getMongoClient();
    await client.connect();
    new GridFSBucket(client.db()).find({filename: {$in: filenames}}).toArray((error, items) => {
        successCB(items);
        client.close();
    })
}

exports.findFile = async (filename, successCB) => {
    return this.findFiles([filename], successCB);
}

exports.deleteFiles = async (filenames, successCB) => {
    const client = getMongoClient();
    await client.connect();
    const gridFSBucket = new GridFSBucket(client.db())
    const errors = {};
    gridFSBucket.find({filename: {$in: filenames}}).toArray((error, items) => {
        items.forEach(item => {
            gridFSBucket.delete(item._id, (_error) => {
                errors[`${item.filename}`] = _error;
            });
        })

        if (!!successCB && typeof successCB === 'function')
            successCB({
                items: items,
                errors: errors
            });
    })
}

exports.deleteFile = async (filename, successCB) => {
    return this.deleteFiles([filename], successCB);
}

/*
dbo.collection("customers").find().sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
 */
// Connection URL

// Create a new MongoClient
function query(collection_name, query, success, failure, fetchMulti = false) {
    const client = getMongoClient();
    client.connect(function (err) {
        if (err != null) {
            console.error(err);
            failure(Errors.MONGO_CONNECTION_FAILURE);
            client.close();
        } else {
            const collection = client.db().collection(collection_name);
            if (fetchMulti) {
                collection.find(query).toArray(function (err, items) {
                    if (err) {
                        console.error(err);
                        failure(err.message);
                    } else {
                        success(items);
                    }
                    client.close();
                });
            } else {
                collection.findOne(query, function (err, item) {
                    if (err) {
                        console.error(err);
                        failure(err.message);
                    } else {
                        success(item);
                    }
                    client.close();
                });
            }
        }
    });
}

exports.getRating = (ratingObj) => {
    const i1 = (!!ratingObj && ratingObj[1]) || 0;
    const i2 = (!!ratingObj && ratingObj[2]) || 0;
    const i3 = (!!ratingObj && ratingObj[3]) || 0;
    const i4 = (!!ratingObj && ratingObj[4]) || 0;
    const i5 = (!!ratingObj && ratingObj[5]) || 0;
    return parseFloat(((i1 + i2 + i3 + i4 + i5) === 0 ? -1 : ((i1 + i2 * 2 + i3 * 3 + i4 * 4 + i5 * 5) / (i1 + i2 + i3 + i4 + i5))).toFixed(2));
}

exports.getMerchant = (mid, success, failure) => {
    const _mid = /^\d+$/.test(mid.trim()) ? Number.parseInt(mid) : undefined;
    if (_mid === undefined)
        failure(Errors.INVALID_PARAM_MID);
    else
        query(COLLECTIONS.MERCHANT, {mid: _mid}, (item) => {
            if (item)
                delete item["password"];
            success(item)
        }, failure);
}

exports.getMerchantForLogin = (username, success, failure) => {
    if (username === undefined)
        failure(Errors.INVALID_PARAM_USERNAME);
    else
        query(COLLECTIONS.MERCHANT, {username: username}, success, failure);
}

exports.getMerchantProducts = (mid, success, failure) => {
    const _mid = /^\d+$/.test(mid.trim()) ? Number.parseInt(mid) : undefined;
    if (_mid === undefined)
        failure(Errors.INVALID_PARAM_MID);
    else
        query(COLLECTIONS.PRODUCTS, {mid: _mid}, success, failure, true);
}

exports.getProduct = (id, success, failure) => {
    const _id = /^\d+$/.test(id.trim()) ? Number.parseInt(id) : undefined;
    if (_id === undefined)
        failure(Errors.INVALID_PARAM_ID);
    else
        query(COLLECTIONS.PRODUCTS, {pid: _id}, success, failure, false);
}

exports.getProductsMulti = (IdArr, success, failure) => {
    if (!IdArr || IdArr.length === 0) {
        failure(Errors.INVALID_PARAM_IDS);
    } else {
        let intArr = IdArr.filter(id => (/^\d+$/.test(id.trim()))).map(id => Number.parseInt(id));
        if (!intArr || intArr.length === 0) {
            failure(Errors.INVALID_PARAM_IDS);
        } else {
            query(COLLECTIONS.PRODUCTS, {pid: {$in: intArr}}, success, failure, true);
        }
    }
}

exports.getMerchantsMulti = (IdArr, success, failure) => {
    if (!IdArr || IdArr.length === 0) {
        failure(Errors.INVALID_PARAM_MIDS);
    } else {
        let intArr = IdArr.filter(id => (/^\d+$/.test(id.trim()))).map(id => Number.parseInt(id));
        if (!intArr || intArr.length === 0) {
            failure(Errors.INVALID_PARAM_MIDS);
        } else {
            query(COLLECTIONS.MERCHANT, {mid: {$in: intArr}},
                (items) => {
                    let _items = [...items];
                    if (!!_items && _items.length > 0)
                        _items = _items.map(item => {
                            delete item["password"];
                            return item;
                        })
                    success(_items)
                }
                , failure, true);
        }
    }
}


// priceRange should match following format only: _high, low_, or low_high
exports.getProducts = (success, failure, queryObj) => {
    let low = -1;
    let high = 9999999;
    const price_range = queryObj['price_range'];
    const search_strings = queryObj['search_strings'];
    const rating_minimum = queryObj['rating_minimum'] ? parseInt(queryObj['rating_minimum']) : 0;
    const recommended = queryObj['recommended'] ? true : false;
    const mid = queryObj['mid'];
    if (price_range) {
        const priceParts = price_range.split('_');
        const dash_index = price_range.indexOf('_');
        if (dash_index <= 0) {
            high = priceParts[1];
        } else if (dash_index > -1 && dash_index + 1 === price_range.length) {
            low = priceParts[0];
        } else {
            low = priceParts[0];
            high = priceParts[1];
        }
    }
    const queryStr = {
        "$or": [
            {
                "$and": [
                    {
                        "price": {
                            "$gte": parseInt(low)
                        }
                    },
                    {
                        "price": {
                            "$lte": parseInt(high)
                        }
                    }
                ]
            },
            {
                "price": -1
            }
        ]
    }
    if (mid) {
        queryStr["mid"] = mid;
    }
    query(COLLECTIONS.PRODUCTS, queryStr, (data) => {
        let filtered = data;
        if (rating_minimum && Number.isInteger(rating_minimum))
            filtered = filtered.filter(item => {
                return this.getRating(item.rating) >= rating_minimum;
            })
        if (search_strings) {
            filtered = filtered.filter((item) => {
                let keysArr = search_strings.toLowerCase().split('_').filter(item => item.length > 0);
                if (search_strings.indexOf(' ') !== -1)
                    keysArr = [...keysArr, ...search_strings.toLowerCase().split(' ').filter(item => item.length > 0)]
                for (let i = 0; i < keysArr.length; i++) {
                    const searchKey = keysArr[i];
                    if (item.name.toLowerCase().includes(searchKey))
                        return true;
                    else if (item.description.toLowerCase().includes(searchKey))
                        return true;
                    else if (item.keys.filter(item => item.toLowerCase().includes(searchKey)).length > 0)
                        return true;
                    if (item.properties) {
                        const propertyValues = Object.values(item.properties);

                        for (let j = 0; j < propertyValues.length; j++) {
                            if (propertyValues[j].toLowerCase().includes(searchKey))
                                return true;
                        }
                    }
                    return false;
                }
            })
        }
        if (recommended) {
            // TODO
            // order by factor of total sold, and rating..
        }
        success(filtered);
    }, failure, true);
}

exports.insertMerchant = async (merchant, success, failure) => {
    const client = getMongoClient();
    await client.connect();
    const collection = client.db().collection(COLLECTIONS.MERCHANT);

    if (!!(await collection.findOne({username: merchant.username}))) {
        await client.close();
        return failure(`Merchant already exists with username: ${merchant.username}`);
    }
    collection.find().sort({mid: -1}).limit(1).toArray(async (err, result) => {
            if (err) {
                await client.close();
                return failure(err.message);
            } else {
                const newId = (result.length === 1) ? (result[0]._id + 1) : 1000;
                merchant.mid = newId;
                merchant._id = newId;
                await collection.insertOne(merchant, async (err, result) => {
                    if (err) {
                        console.log(err.message);
                        return failure(err.message);
                    } else return success(merchant);
                    await client.close();
                })
            }
        }
    )
}

exports.updateMerchant = async (merchant, success, failure) => {
    const client = getMongoClient();
    await client.connect();
    const collection = client.db().collection(COLLECTIONS.MERCHANT);
    const existingMerchant = await collection.findOne({_id: merchant.mid});
    if (!existingMerchant) {
        await client.close();
        return failure(`Merchant does not exists: ${merchant.username}`);
    } else {
        await collection.updateOne({_id: existingMerchant._id}, {$set: {...merchant}}, async (err, result) => {
            if (err) {
                console.log(err.message);
                return failure(err.message);
            } else return success(merchant);
            client.close();
        })
    }
}

exports.insertProduct = async (product, success, failure) => {
    const client = getMongoClient();
    await client.connect();
    const collection = client.db().collection(COLLECTIONS.PRODUCTS);
    collection.find().sort({pid: -1}).limit(1).toArray(async (err, result) => {
            if (err) {
                client.close();
                return failure(err.message);
            } else {
                const newId = (result.length === 1) ? (result[0]._id + 1) : 1000;
                product.pid = newId;
                product._id = newId;
                await collection.insertOne(product, async (err, result) => {
                    if (err) {
                        console.log(err.message);
                        return failure(err.message);
                    } else return success(product);
                    await client.close();
                })
            }
        }
    )
}

exports.updateProduct = async (product, success, failure) => {
    const client = getMongoClient();
    await client.connect();
    const collection = client.db().collection(COLLECTIONS.PRODUCTS);
    const existingProduct = await collection.findOne({_id: product.pid});
    if (!existingProduct) {
        await client.close();
        return failure(`Product does not exists: ${product.pid}`);
    } else {
        await collection.updateOne({_id: existingProduct._id}, {$set: {...product}}, async (err, result) => {
            if (err) {
                console.log(err.message);
                return failure(err.message);
            } else return success(existingProduct);
            await client.close();
        })
    }
}
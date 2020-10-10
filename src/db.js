const MongoClient = require('mongodb').MongoClient;

const COLLECTIONS = {
    MERCHANT: "merchant",
    SUBSCRIPTION: "subscription",
    PRODUCTS: "products"
}

/*
db.products.createIndex( { id: -1 } )
db.products.createIndex( { mid: -1 } )

dbo.collection("customers").find().sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
 */
// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'acemarket';

// Create a new MongoClient
const client = new MongoClient(
    url,
    {useUnifiedTopology: true},
    {useNewUrlParser: true},
    {connectTimeoutMS: 30000},
    {keepAlive: 1}
);

function query(collection_name, query, success, failure, fetchMulti = false) {
    client.connect(function (err) {
        const dbo = client.db(dbName);
        if (err != null) {
            failure("Mongo failed to connect.")
        } else {
            const collection = dbo.collection(collection_name);
            if (fetchMulti) {
                collection.find(query).toArray(function (err, items) {
                    if (err) {
                        failure(err.message);
                    } else {
                        success(items);
                    }
                    //client.close();
                });
            } else {
                collection.findOne(query, function (err, item) {
                    if (err) {
                        failure(err.message);
                    } else {
                        success(item);
                    }
                    //client.close();
                });
            }
        }
    });
}

exports.getRating = (ratingObj) => {
    const i1 = ratingObj[1] || 0;
    const i2 = ratingObj[2] || 0;
    const i3 = ratingObj[3] || 0;
    const i4 = ratingObj[4] || 0;
    const i5 = ratingObj[5] || 0;
    return parseFloat(((i1 + i2 + i3 + i4 + i5) === 0 ? -1 : ((i1 + i2 * 2 + i3 * 3 + i4 * 4 + i5 * 5) / (i1 + i2 + i3 + i4 + i5))).toFixed(2));
}

exports.getMerchant = (mid, success, failure) => {
    query(COLLECTIONS.MERCHANT, {mid: mid}, success, failure);
}

exports.getMerchantProducts = (mid, success, failure) => {
    query(COLLECTIONS.PRODUCTS, {mid: mid}, success, failure, true);
}

exports.getProduct = (id, success, failure) => {
    query(COLLECTIONS.PRODUCTS, {id: id}, success, failure, false);
}
// priceRange should match following format only: _high, low_, or low_high
exports.getProducts = (success, failure, queryObj) => {
    let low = -1;
    let high = 9999999;
    const price_range = queryObj['price_range'];
    const string_keys = queryObj['string_keys'];
    const rating_minimum = queryObj['rating_minimum'] ? parseInt(queryObj['rating_minimum']) : 0;
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

        if (string_keys) {
            filtered = filtered.filter((item) => {
                const keysArr = string_keys.toLowerCase().split('_');
                for (let i = 0; i < keysArr.length; i++) {
                    const searchKey = keysArr[i];
                    if (item.name.toLowerCase().includes(searchKey))
                        return true;
                    else if (item.description.toLowerCase().includes(searchKey))
                        return true;
                    else if (item.keys.includes(searchKey))
                        return true;
                    if (item.properties) {
                        const propertyValues = Object.values(item.properties);

                        for (let j = 0; j < propertyValues.length; j++) {
                            if (propertyValues[j].toLowerCase().includes(searchKey))
                                return true;
                        }
                    }
                }
            })
        }
        success(filtered);
    }, failure, true);
}
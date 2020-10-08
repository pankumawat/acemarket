const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const COLLECTIONS = {
    MERCHANT: "merchant",
    SUBSCRIPTION: "subscription",
    PRODUCTS: "products"
}

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'acemarket';

// Create a new MongoClient
const client = new MongoClient(url, {useUnifiedTopology: true}, {useNewUrlParser: true}, {connectTimeoutMS: 30000}, {keepAlive: 1});

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
                        failure("DBErr " + err.message);
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

exports.getMerchant = (mid, success, failure) => {
    query(COLLECTIONS.MERCHANT, {mid: mid}, success, failure);
}

exports.getMerchantProducts = (mid, success, failure) => {
    query(COLLECTIONS.PRODUCTS, {mid: mid}, success, failure, true);
}

exports.getProduct = (id, success, failure) => {
    query(COLLECTIONS.PRODUCTS, {id: id}, success, failure, false);
}
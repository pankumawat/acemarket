const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    port: process.env.SQL_PORT || 3306,
    user: 'root',
    password: 'Dumb@911',
    database: 'qlinks'
});

exports.getShortNameRow = (short_name) => {
    let selectQuery = 'SELECT * FROM links WHERE short_name = ?';
    let query = mysql.format(selectQuery, [short_name]);

    return new Promise((resolve, reject) => {
        pool.query(query, function (error, results, fields) {
            if (error) reject(error);
            if (results) resolve(results);
            resolve([]);
        });
    });
}

exports.addLink = (data) => {
    let insertQuery = 'INSERT INTO ?? (??,??,??,??) VALUES (?,?,?,?)';
    let query = mysql.format(insertQuery, ["links", "short_name", "long_url", "owner", "status", data.short_name, data.long_url, data.owner, "ACTIVE"]);
    return new Promise((resolve, reject) => {
        pool.query(query, (err, response) => {
            if (err) {
                reject(err);
            }
            // rows added
            resolve(response);
        });
    });
}


/*
function addRow(data) {
    let insertQuery = 'INSERT INTO ?? (??,??) VALUES (?,?)';
    let query = mysql.format(insertQuery, ["todo", "user", "notes", data.user, data.value]);
    pool.query(query, (err, response) => {
        if (err) {
            console.error(err);
            return;
        }
        // rows added
        console.log(response.insertId);
    });
}

function queryRow(userName) {
    let selectQuery = 'SELECT * FROM ?? WHERE ?? = ?';
    let query = mysql.format(selectQuery, ["todo", "user", userName]);
    // query = SELECT * FROM `todo` where `user` = 'shahid'
    pool.query(query, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        // rows fetch
        console.log(data);
    });
}

// Multiple

let insertQuery = 'INSERT INTO ?? (??,??) VALUES (?,?)';
let values = [["shahid", "hello"], ["Rohit", "Hi"]]; // each array is one row
let query = mysql.format(insertQuery, ["todo", "user", "notes", values]);

function updateRow(data) {
    let updateQuery = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
    let query = mysql.format(updateQuery, ["todo", "notes", data.value, "user", data.user]);
    // query = UPDATE `todo` SET `notes`='Hello' WHERE `name`='shahid'
    pool.query(query, (err, response) => {
        if (err) {
            console.error(err);
            return;
        }
        // rows updated
        console.log(response.affectedRows);
    });
}

function deleteRow(userName) {
    let deleteQuery = "DELETE from ?? where ?? = ?";
    let query = mysql.format(deleteQuery, ["todo", "user", userName]);
    // query = DELETE from `todo` where `user`='shahid';
    pool.query(query, (err, response) => {
        if (err) {
            console.error(err);
            return;
        }
        // rows deleted
        console.log(response.affectedRows);
    });
}

*/
exports.fetchUser = (username) => {
    return new Promise((resolve, reject) => {
        resolve({"username": "pankaj", "password": "pass123"})
    })
}
// this one is sufficient..
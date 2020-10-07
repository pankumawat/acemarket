const apiRoute = require('express').Router();
const db = require('./db');
const core = require('./core');
const parseUserAgent = core.parseUserAgent;

// Functions
const getSuccessResponse = core.getSuccessResponse;
const getErrorResponse = core.getErrorResponse;
const getShortIdValidated = core.getShortIdValidated;
const getJwtToken = core.getJwtToken;

apiRoute.get('/', (req, res) => {
    res.status(200).json({message: 'Connected!'});
});

apiRoute.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        db.fetchUser(username).then(function (user) {
            if (user.password == password) {
                getJwtToken(
                    {username: username, ...user}
                ).then(tokenObj => {
                    const localUsrObj = {...user}
                    delete localUsrObj.password;
                    return res.json(getSuccessResponse({
                        user: {username: username, ...localUsrObj},
                        ...tokenObj
                    }))
                }).catch(error => {
                    console.log(error.stack)
                    return res.status(500).json(getErrorResponse(error.message));
                });
            } else {
                return res.status(401).json(getErrorResponse(`Incorrect username or password`));
            }
        }).catch(function (error) {
            console.log(error.message)
            return res.status(500).json(
                getErrorResponse(error.message));
        });
    } else {
        return res.status(400).json({user: username, pass: password});
    }
});

apiRoute.get('/short/:short_name', (req, res) => {
    const short_name = req.params['short_name'];
    getShortIdValidated(short_name).then(data => {
        res.status(200).json(getSuccessResponse(data))
    }).catch(error => {
        res.status(500).json(
            getErrorResponse(error.message)
        )
    })
});

apiRoute.post('/short', (req, res) => {
    let short_name = req.body.short_name;
    let long_url = req.body.long_url;
    const isGuest = true; //req.body.guest; // Currently all are guests since no auth is in place.

    // Sanitize input url
    try {
        let final_url = long_url;
        if (!long_url.startsWith('http')) {
            if (!long_url.split('.')[0].includes('://')) {
                const possible_valid_value = `http://${long_url}`;
                new URL(possible_valid_value);
                final_url = possible_valid_value;
            }
        }
        new URL(final_url);
        long_url = final_url;
    } catch (error) {
        res.status(400).json(
            getErrorResponse("Please enter a valid url."))
    }

    if (core.StringConstants.ME_URL.includes(new URL(long_url).hostname)) {
        res.status(400).json(
            getErrorResponse("Our urls are already short."))
    } else if (long_url.length > 1980) {
        res.status(400).json(
            getErrorResponse(`URL Exceeding allowed length by ${long_url.length - 1980} characters.`))
    } else {
        getShortIdValidated(isGuest ? undefined : short_name, isGuest ? 5 : 3).then(response => {
            if (response.available) {
                db.addLink({
                    short_name: response.short_name,
                    long_url,
                    owner: (isGuest ? "Guest" : "SOME_USER")
                }).then(() => {
                    res.status(200).json(
                        getSuccessResponse({
                            ...response,
                            long_url: long_url,
                        })
                    )
                }).catch(error => {
                    res.status(500).json(
                        getErrorResponse(error.message)
                    )
                })

            } else {
                res.status(200).json(
                    getErrorResponse("This short name has already been taken", response))
            }
        }).catch(error => {
            res.status(500).json(
                getErrorResponse(error.message)
            )
        })
    }
});


apiRoute.get('/p', (req, res) => {
    return res.send(JSON.stringify(parseUserAgent(req)));
});


module.exports = apiRoute;
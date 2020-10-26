const showSnackbar = (isSuccess, message, timeout) => {
    const snackbar = document.getElementById("snackbar")
    snackbar.style["background-color"] = isSuccess ? "#90EE90" : "#FFCCCC";
    snackbar.innerHTML = message;
    snackbar.className = "show";
    setTimeout(() => {
        snackbar.className = "";
    }, timeout ? timeout : 2000);
}

const showError = (error, timeout) => {
    showSnackbar(false, error, timeout)
}

const showSuccess = (message, timeout) => {
    showSnackbar(true, message, timeout)
}

const silentUrlChangeTo = (url) => {
    window.history.pushState({}, null, url);
}

const getUrlPath = (url) => {
    return new URL(url || window.location.href).pathname;
}

const getQueries = (url) => {
    const retObj = {};
    for (const [key, value] of new URLSearchParams(new URL(url || window.location.href).search).entries()) {
        retObj[key] = value;
    }
    return retObj;
}

const VALID_PATHS = {
    ERROR: "/error.html",
    ADMIN_LOGIN: "/admin/login",
    ADMIN_HOME: "/admin/home",
    HOME: "/home",
    DETAILS: "/details",
    MERCHANT_LOGIN: "/merchant/login",
    MERCHANT_HOME: "/merchant/home",
    LOGOUT: "/logout",
    ABOUT: "/about",
    CART: "/cart",
    SEARCH: "/search"
}

const previewImg = (event) => {
    const _this = event.target;
    if (_this.files.length >= 15) {
        showError("Maximum allowed number of files is 15", 4000);
        _this.value = '';
        return false;
    }
    const previewImgId = `${_this.getAttribute("id") || _this.getAttribute("name")}_preview`;
    const previewDiv = document.getElementById(previewImgId);
    previewDiv.style.display = "block";
    previewDiv.innerHTML = "";
    if (!!event.target.files) {
        for (let i = 0; i < _this.files.length; i++) {
            const img = document.createElement("IMG");
            img.style.height = "120px";
            img.classList.add("image-preview");
            img.src = window.URL.createObjectURL(_this.files[i]);
            previewDiv.appendChild(img);
        }
    }
    return true;
}

const getPageName = (url) => {
    const cPath = getUrlPath(url);
    const matched = Object.keys(VALID_PATHS).filter(key => (cPath == VALID_PATHS[key]));
    //console.log(`url=${url}, cPath=${cPath}, matched=${matched}`);
    return (!!matched && matched.length > 0 && matched[0]) || "ROOT";
}

getLoggedInUser = () => {
    let user = localStorage.getItem(MEM_KEYS.ACEM_USER);
    user = user && JSON.parse(localStorage.getItem(MEM_KEYS.ACEM_USER));
    if (user) {
        // Check if remaining session is at-least 5 seconds in future else consider non logged in.
        if ((new Date(user.expireAt) - new Date()) > 5000) {
            return user;
        } else {
            localStorage.removeItem(MEM_KEYS.ACEM_USER);
        }
    }
}

const MEM_KEYS = {
    ACEM_STATE_CART: "acemarket_cart_state",
    ACEM_GET_CACHE: "acemarket_get_cache",
    ACEM_USER: "acemarket_current_user",
    ACEM_ERROR: "acemarket_error"
}

const SVG = {
    "LOGO": '<svg  stroke="white" stroke-width="20" stroke-linecap="round" width="10%" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 465 465" style="enable-background:new 0 0 465 465;" xml:space="preserve"> <path d="M346.736,44.623C321.494,15.014,283.06,0,232.5,0s-88.994,15.014-114.236,44.623c-25.38,29.771-29.169,64.65-29.169,82.792 v210.171c0,18.142,3.789,53.021,29.169,82.792C143.506,449.987,181.94,465,232.5,465s88.994-15.013,114.236-44.622 c25.38-29.771,29.169-64.65,29.169-82.792V127.415C375.905,109.273,372.116,74.394,346.736,44.623z M232.5,162 c-10.477,0-19-8.523-19-19v-40.716c0-10.477,8.523-19,19-19s19,8.523,19,19V143C251.5,153.477,242.977,162,232.5,162z M360.905,337.586c0,18.771-6.19,112.414-128.405,112.414s-128.405-93.643-128.405-112.414V127.415 c0-18.379,5.953-108.516,120.905-112.279v53.992c-15.15,3.426-26.5,16.985-26.5,33.156V143c0,16.171,11.35,29.73,26.5,33.156v61.628 c0,4.143,3.357,7.5,7.5,7.5s7.5-3.357,7.5-7.5v-61.628c15.15-3.426,26.5-16.985,26.5-33.156v-40.716 c0-16.171-11.35-29.73-26.5-33.156V15.136c114.953,3.764,120.905,93.9,120.905,112.279V337.586z"/> </svg>'
}

const fillLogo = () => {
    const arr = document.getElementsByClassName("logo");
    for (let i = 0; i < arr.length; i++) {
        arr[i].innerHTML = SVG.LOGO;
    }
}
/*
 * { "url" : { "ts", "data" }
 */
const GETcache = (localStorage && localStorage.getItem(MEM_KEYS.ACEM_GET_CACHE)) ? JSON.parse(localStorage.getItem(MEM_KEYS.ACEM_GET_CACHE)) : {};

const addToGETCache = (url, data) => {
    GETcache[url] = {
        ts: Date.now(),
        data: data
    }
    if (localStorage) {
        localStorage.setItem(MEM_KEYS.ACEM_GET_CACHE, JSON.stringify(GETcache));
    }
}

setInterval(() => {
    Object.keys(GETcache).forEach(url => {
        if ((Date.now() - GETcache[url].ts) >= 10000) {
            delete GETcache[url];
        }
    })
}, 5000);

const makeGetCall = (url, success, failure) => {
    const backupObj = {...GETcache[url]};
    if (GETcache[url]) {
        setTimeout(() => success(backupObj.data), 200);
        console.debug(`GET ${url} served from Cache`);
    } else {
        console.debug(`GET ${url}`);
        fetch(url).then((response) => response.json()).then((response) => {
            if (response.success) {
                success(response);
                addToGETCache(url, response);
            } else {
                if (failure)
                    failure(response);
                else
                    showError(`Something went wrong. ${response.error}`, 3000);
            }
        }).catch((error) => {
            showError(`Something is not right... ${error.message}`, 5000);
        });
    }
}

const makePostCall = (url, body, success, failure) => {
    const headers = {
        "Content-Type": "application/json"
    }
    const loggedInUser = getLoggedInUser();
    if (!!loggedInUser) {
        headers["Authorization"] = `${loggedInUser.user.username} ${loggedInUser.accessToken}`;
    }

    fetch(url, {
        method: 'post',
        headers: {
            ...headers
        },
        body: JSON.stringify(body)
    }).then((response) => response.json()).then((response) => {
        if (response.success) {
            if (success)
                success(response);
        } else {
            if (failure)
                failure(response);
            else
                showError(response.error, 3000);
        }
    }).catch((error) => {
        showError(`Something is not right. ${error.message}`, 5000);
    });
}

window.onerror = function (msg, path, line) {
    console.error(JSON.stringify({
        msg,
        url: getUrlPath(),
        line,
    }, undefined, 4))

    const url = (!!path && path.length > 0) ? path : "/home";
    if (getUrlPath(window.location.href) !== VALID_PATHS.HOME) {
        showError(`Something went wrong ${msg}`, 3000);
        //setTimeout(() => window.location.href = VALID_PATHS.HOME, 3000);
    } else {
        showError(`Something went wrong ${msg}`, 3000);
        //setTimeout(() => window.location.href = VALID_PATHS.ERROR, 3000);
    }
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

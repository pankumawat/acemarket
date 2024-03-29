const showSnackbar = (isSuccess, message, timeout) => {
    const snackbar = document.getElementById("snackbar")
    snackbar.style["background-color"] = isSuccess ? "#90EE90" : "#FFCCCC";
    snackbar.innerHTML = message;
    snackbar.className = "show";
    setTimeout(() => {
        snackbar.className = "";
    }, timeout ? timeout : 2000);
}

showError = (error, timeout) => {
    showSnackbar(false, error, timeout)
}

showSuccess = (message, timeout) => {
    showSnackbar(true, message, timeout)
}

ellipsis = (inputStr, len) => {
    const _len = (!len || (typeof len !== 'number') || len < 1) ? 10 : len;
    return `${inputStr.substring(0, _len)}${inputStr.length > _len ? '...' : ''}`;
}

silentUrlChangeTo = (url) => {
    window.history.pushState({}, null, url);
}

getUrlPath = (url) => {
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
    NULL: "/home/NULL",
    ERROR: "/error.html",
    ADMIN_LOGIN: "/admin/login",
    ADMIN_HOME: "/admin/home",
    HOME: "/home",
    DETAILS: "/details",

    MERCHANT_LOGIN: "/merchant/login",
    MERCHANT_ITEM: "/merchant/item",
    MERCHANT_LIST_ITEMS: "/merchant/items",
    MERCHANT_HOME: "/merchant/home",

    LOGOUT: "/logout",
    ABOUT: "/about",
    CART: "/cart",
    SEARCH: "/search"
}

previewImg = (event) => {
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

getPageName = (url) => {
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

isAdminLoggedIn = () => {
    const loggedInUser = getLoggedInUser();
    return (!!loggedInUser && loggedInUser.isAdmin === true);
}

isMerchantLoggedIn = () => {
    const loggedInUser = getLoggedInUser();
    return (!!loggedInUser && !loggedInUser.isAdmin);
}

MEM_KEYS = {
    ACEM_STATE_CART: "acemarket_cart_state",
    ACEM_GET_CACHE: "acemarket_get_cache",
    ACEM_USER: "acemarket_current_user",
    ACEM_ERROR: "acemarket_error"
}

makeGetCall = (url, success, failure) => {
    console.debug(`GET ${url}`);
    fetch(url).then((response) => response.json()).then((response) => {
        if (response.success) {
            success(response);
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

makePostCall = (url, body, success, failure) => {
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
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

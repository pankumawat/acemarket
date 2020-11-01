class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();

        this.handleNavigation = this.handleNavigation.bind(this);
        this.addProductToCart = this.addProductToCart.bind(this);
        this.remProductFromCart = this.remProductFromCart.bind(this);
        this.silentNav = this.silentNav.bind(this);
        this.getMainRenderBody = this.getMainRenderBody.bind(this);
        this.updateState = this.updateState.bind(this);
        this.loginSuccess = this.loginSuccess.bind(this);
        this.getInitialState = this.getInitialState.bind(this);
        this.logout = this.logout.bind(this);

        this.handleNavigation();

        if (!!localStorage && !!localStorage.getItem(MEM_KEYS.ACEM_ERROR)) {
            showSuccess("Thank you for believing that we would recover.. :)", 3000)
            localStorage.removeItem(MEM_KEYS.ACEM_ERROR);
        }
    }

    getInitialState = () => {
        return {
            cart: localStorage && localStorage.getItem(MEM_KEYS.ACEM_STATE_CART)
                ? JSON.parse(localStorage.getItem(MEM_KEYS.ACEM_STATE_CART)) :
                {
                    quantity: {},
                    total: 0,
                    products: {},
                },
            products: [],
            product: undefined,
            page: undefined,
            query: undefined,
            loggedInUser: getLoggedInUser()
        }
    }

    clearMemory = () => {
        if (!!localStorage)
            Object.keys(MEM_KEYS).forEach(memKey => localStorage.removeItem(MEM_KEYS[memKey]));
    }

    loginSuccess = (loggedInUser) => {
        this.updateState({loggedInUser: loggedInUser}, true, true);
    }

    logout = () => {
        this.clearMemory();
        this.state = this.getInitialState();
    }

    addProductToCart = (product, quantity) => {
        const cart = {...this.state.cart};
        if (!cart.quantity[product.pid]) {
            cart.quantity[product.pid] = Number.parseInt(quantity);
            cart.products[product.pid] = {pid: product.pid, mid: product.mid};
        } else {
            cart.quantity[product.pid] = cart.quantity[product.pid] + Number.parseInt(quantity);
        }
        cart.total = cart.total + Number.parseInt(quantity);
        if (localStorage) {
            localStorage.setItem(MEM_KEYS.ACEM_STATE_CART, JSON.stringify(cart))
        }
        this.updateState({cart: cart}, false);
        if (!!product.name)
            showSuccess(`${product.name} added successfully!`);
    }

    remProductFromCart = (product, quantity) => {
        const cart = {...this.state.cart};
        if (cart.quantity[product.pid]) {
            cart.total = cart.total - (cart.quantity[product.pid] < cart.quantity[product.pid] ? cart.quantity[product.pid] : Number.parseInt(quantity));
            cart.quantity[product.pid] = cart.quantity[product.pid] - Number.parseInt(quantity);
            if (cart.quantity[product.pid] <= 0) {
                delete cart.quantity[product.pid];
                delete cart.products[product.pid];
            }
            cart.total = cart.total <= 0 ? 0 : cart.total;
            if (localStorage) {
                localStorage.setItem(MEM_KEYS.ACEM_STATE_CART, JSON.stringify(cart))
            }
            this.updateState({cart: cart}, false);
        }
    }

    silentNav = (event, path, delay) => {
        let url = "/home";
        if (!!event) {
            event.preventDefault();
            url = !!event.target.href && event.target.href.length > 0 ? event.target.href : url;
        }
        url = (!!path && path.length > 0) ? path : url;
        console.debug(`silentNav("${url}")`);
        const preSwitchPage = getPageName();
        silentUrlChangeTo(url);
        const postSwitchPage = getPageName();
        if (this.state.url !== url || preSwitchPage !== postSwitchPage) {
            if (preSwitchPage === "SEARCH" && postSwitchPage !== "SEARCH") {
                delete this.state["products"];
            }
            setTimeout(() => {
                this.handleNavigation();
                this.updateState({url: url}, false);
            }, delay === true ? 200 : 0)
        }
    }

    updateState = (states, onlyThis = false, instant = true) => {
        if (onlyThis)
            setTimeout(() => this.setState({...states}), instant ? 0 : 200);
        else {
            setTimeout(() => this.setState({...this.state, ...states}), instant ? 0 : 200);
        }
    }

    functions = {
        addProductToCart: this.addProductToCart,
        remProductFromCart: this.remProductFromCart,
        setProducts: this.setProducts,
        silentNav: this.silentNav,
        updateState: this.updateState,
        loginSuccess: this.loginSuccess,
        logout: this.logout
    }

    handleNavigation = () => {
        const page = getPageName();
        console.log(`handleNavigation(${page})`);
        this.state = {...this.state, page, url: getUrlPath()};
        switch (page) {
            case "ADMIN_HOME": {
                if (!isAdminLoggedIn()) {
                    this.silentNav(undefined, VALID_PATHS.HOME);
                }
                break;
            }
            case "MERCHANT_HOME": {
                if (!isMerchantLoggedIn()) {
                    this.silentNav(undefined, VALID_PATHS.HOME);
                }
                break;
            }
            case "SEARCH": {
                /*
                 * query { key: val }
                 * price_range e.g. 100_1200
                 * search_strings e.g. chocolate_pastry_juice
                 * rating_minimum e.g.
                 * recommended
                 */
                const queryObj = getQueries();
                if (queryObj.size === 0) {
                    this.silentNav(undefined, VALID_PATHS.HOME);
                } else {
                    const stateHasQuery = !!this.state.query;
                    const areUrlAdStateQueryDifferent = !_.isEqual(this.state.query, getQueries());
                    const doNotHaveProducts = !this.state.products || this.state.products.length === 0;
                    if (!stateHasQuery || (stateHasQuery && areUrlAdStateQueryDifferent) || doNotHaveProducts) {
                        let url = "/api/search?";
                        Object.keys(queryObj).forEach(key => {
                            url = `${url}${key}=${queryObj[key]}&`
                        });
                        makeGetCall(url, (response) => {
                            if (response.data.length === 0) {
                                showError("No items found matching your query.", 3000)
                            } else {
                                delete this.state["product"];
                                this.updateState({query: queryObj, products: [...response.data]}, false);
                            }
                        });
                    }
                }
                break;
            }
            case "CART": {
                if (this.state.cart.total <= 0) {
                    showError("Your basket is empty.", 2000);
                    this.silentNav(undefined, VALID_PATHS.HOME);
                }
                break;
            }
            case "DETAILS": {
                const queryObj = getQueries();
                if (queryObj.size === 0 || !queryObj.pid) {
                    this.silentNav(undefined, VALID_PATHS.HOME);
                } else {
                    const hasProductButDiffId = !!this.state.product && (String(queryObj.pid) !== String(this.state.product.pid));
                    if (hasProductButDiffId || !this.state.product) {
                        makeGetCall(`/api/p/${queryObj.pid}`, (response) => {
                            this.updateState({page: page, product: response.data}, false);

                            const qs = response.data.keys.reduce((a, c) => `${a}_${c}`);
                            this.state = {...this.state, products: []};
                            makeGetCall(`/api/search/?search_strings=${qs}`, (response) => {
                                let products = [...response.data];
                                if (products.length < 10) {
                                    makeGetCall(`/api/search/?limit=10`, (responseAttempt2) => {
                                        const alreadyInList = [];
                                        products.forEach(product => alreadyInList.push(product.pid));
                                        products = [...products, ...responseAttempt2.data.filter(product => !alreadyInList.includes(product.pid))];
                                        this.updateState({products: products}, false, true);
                                    });
                                } else {
                                    this.updateState({products: products}, false, true);
                                }

                            });
                        });
                    }
                }
                break;
            }
            case "LOGOUT": {
                this.logout();
                this.silentNav(undefined, VALID_PATHS.HOME, true);
                break;
            }
            case "HOME": {
                let url = "/api/search?";
                makeGetCall(url, (response) => {
                    if (response.data.length === 0) {
                        showError("No products were received.", 3000)
                    } else {
                        delete this.state["product"];
                        delete this.state["query"];
                        this.updateState({products: [...response.data]}, false);
                    }
                });
                break;
            }
            case "MERCHANT_ITEM": {
                const queryObj = getQueries();
                if (!!queryObj.pid) {
                    const hasProductButDiffId = !!this.state.product && (String(queryObj.pid) !== String(this.state.product.pid));
                    if (hasProductButDiffId || !this.state.product) {
                        makeGetCall(`/api/p/${queryObj.pid}`, (response) => {
                            this.updateState({product: response.data}, false);
                        });
                    }
                } else {
                    delete this.state.product;
                    this.updateState({}, false);
                }
                break;
            }
            default : {
                // Not yet defined: "ABOUT", "ROOT"
                const doNothingPages = ["MERCHANT_LOGIN", "ADMIN_LOGIN"];
                if (!doNothingPages.includes(page))
                    this.silentNav(undefined, VALID_PATHS.HOME);
                break;
            }
        }
    }

    getMainRenderBody = () => {
        switch (getPageName()) {
            case "MERCHANT_LOGIN": {
                return (<div className="box center">
                    <div className="login margin36"><MerchantLogin data={this.state} functions={this.functions}/></div>
                </div>)
            }
            case "MERCHANT_ITEM": {
                return (
                    <div>
                        <Nav product={this.state.product} functions={this.functions}/>
                        <ProductForm product={this.state.product} fuctions={this.props.function}/>
                    </div>
                )
            }
            case "MERCHANT_HOME": {
                return (
                    <div>
                        <Nav functions={this.functions}/>
                        <MerchantHome/>
                    </div>
                )
            }
            case "ADMIN_LOGIN": {
                return (<div className="box center">
                    <div className="login margin36"><AdminLogin data={this.state} functions={this.functions}/></div>
                </div>)
            }
            case "ADMIN_HOME": {
                return (
                    <div>
                        <Nav functions={this.functions}/>
                        <AdminHome/>
                    </div>
                )
            }
            case "SEARCH": {
                return (
                    <div>
                        <Nav incart={this.state.cart.total} functions={this.functions}/>
                        <Rail railml={true} functions={this.functions}
                              products={(!!this.state.products && this.state.products.length > 0) ? [...this.state.products] : []}/>
                    </div>
                )
            }
            case "CART": {
                return (
                    <div>
                        <Nav incart={this.state.cart.total} functions={this.functions}/>
                        <Cart functions={this.functions} cart={{...this.state.cart}}/>
                    </div>
                )
            }
            case "DETAILS": {
                return (
                    <div>
                        <Nav product={this.state.product} incart={this.state.cart.total} functions={this.functions}/>
                        <div className="container-fluid margin20">
                            <Details product={this.state.product} functions={this.functions}/>
                            <Rail functions={this.functions}
                                  products={this.state.products}
                                  railml={false}
                                  recommended_for={!!this.state.product ? this.state.product.pid : undefined}
                            />
                        </div>
                    </div>
                )
            }
            case "HOME" : {
                return (
                    <div>
                        <Nav incart={this.state.cart.total} functions={this.functions}/>
                        <Rail railml={true} functions={this.functions}
                              products={!!this.state.products ? [...this.state.products] : []}/>
                    </div>
                );
            }
        }
    }

    render = () => (<div className="margin-auto">{this.getMainRenderBody()}</div>)
}

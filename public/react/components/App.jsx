class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
            loggedInUser: this.getLoggedInUser()
        }
        this.handleNavigation = this.handleNavigation.bind(this);
        this.addProductToCart = this.addProductToCart.bind(this);
        this.remProductFromCart = this.remProductFromCart.bind(this);
        this.silentNav = this.silentNav.bind(this);
        this.getMainRenderBody = this.getMainRenderBody.bind(this);
        this.updateState = this.updateState.bind(this);
        this.loginSuccess = this.loginSuccess.bind(this);
        this.getLoggedInUser = this.getLoggedInUser.bind(this);
        this.logout = this.logout.bind(this);

        this.handleNavigation();

        if (!!localStorage && !!localStorage.getItem(MEM_KEYS.ACEM_ERROR)) {
            showSuccess("Thank you for believing that we would recover.. :)", 3000)
            localStorage.removeItem(MEM_KEYS.ACEM_ERROR);
        }
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

    loginSuccess = (loggedInUser) => {
        this.updateState({loggedInUser: loggedInUser}, true, true);
    }

    logout = () => {
        localStorage.removeItem(MEM_KEYS.ACEM_USER);
        this.updateState({}, true, true);
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

    silentNav = (event, path) => {
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
        if (this.state.url != url || preSwitchPage !== postSwitchPage) {
            if (preSwitchPage == "SEARCH" && postSwitchPage != "SEARCH") {
                delete this.state["products"];
            }
            this.handleNavigation();
            this.updateState({url: url}, false, false);
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
        getLoggedInUser: this.getLoggedInUser,
        logout: this.logout
    }

    handleNavigation = () => {
        const page = getPageName();
        switch (page) {
            case "ROOT": {
                this.silentNav(undefined, VALID_PATHS.HOME);
                break;
            }
            case "ADMINHOME": {
                const loggedInUser = this.getLoggedInUser();
                if(!(!!loggedInUser && loggedInUser.isAdmin === true)) {
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
                    const doNotHaveProducts = !this.state.products || this.state.products.length == 0;
                    if (!stateHasQuery || (stateHasQuery && areUrlAdStateQueryDifferent) || doNotHaveProducts) {
                        let url = "/api/search?";
                        Object.keys(queryObj).forEach(key => {
                            url = `${url}${key}=${queryObj[key]}&`
                        });
                        this.state = {...this.state, page: page};
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
                    const hasProductButDiffId = !!this.state.product && queryObj.pid !== this.state.product;
                    if (hasProductButDiffId || !this.state.product) {
                        makeGetCall(`/api/product/${queryObj.pid}`, (response) => {
                            this.updateState({page: page, product: response.data}, false);

                            const qs = response.data.keys.reduce((a, c) => `${a}_${c}`);
                            makeGetCall(`/api/search/?search_strings=${qs}`, (response) => {
                                this.updateState({products: [...response.data]}, false);
                            });
                        });
                    }
                }
                break;
            }
            case "LOGIN": {
                this.state = {...this.state, page: page};
                break;
            }
            case "ADMINLOGIN": {
                this.state = {...this.state, page: page};
                break;
            }
            case "LOGOUT": {
                const _state = {...this.state};
                delete _state["user"];
                this.updateState(_state, true);
                this.silentNav(undefined, VALID_PATHS.HOME);
                break;
            }
            case "ABOUT": {
                this.silentNav(undefined, VALID_PATHS.HOME);
                break;
            }
            case "HOME": {
                this.state = {...this.state, page: page};
                if (!this.state.products || this.state.products.length === 0) {
                    let url = "/api/search?";
                    makeGetCall(url, (response) => {
                        if (response.data.length === 0) {
                            showError("Failed to fetch items.", 3000)
                        } else {
                            delete this.state["product"];
                            delete this.state["query"];
                            this.updateState({products: [...response.data]}, false);
                        }
                    });
                }
                break;
            }
            default : {
                this.silentNav(undefined, VALID_PATHS.HOME);
                break;
            }
        }
    }

    getMainRenderBody = () => {
        switch (getPageName()) {
            case "LOGIN": {
                return (<div className="box center">
                    <div className="login margin36"><Login data={this.state} functions={this.functions}/></div>
                </div>)
            }
            case "ADMINLOGIN": {
                return (<div className="box center">
                    <div className="login margin36"><AdminLogin data={this.state} functions={this.functions}/></div>
                </div>)
            }
            case "SEARCH": {
                return (
                    <div>
                        <Nav incart={this.state.cart.total} functions={this.functions}/>
                        <Shorts railml={true} functions={this.functions}
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
                        <Nav incart={this.state.cart.total} functions={this.functions}/>
                        <div className="container-fluid margin20">
                            <div className="row">
                                <div className="col-md-12">
                                    <Details product={this.state.product} functions={this.functions}/>
                                    <hr/>
                                    <h2><u>Similar items</u></h2>
                                    <Shorts functions={this.functions}
                                            products={this.state.products}
                                            recommended_for={!!this.state.product ? this.state.product.pid : undefined}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            case "ABOUT": {
                break;
            }
            case "HOME" : {
                return (
                    <div>
                        <Nav incart={this.state.cart.total} functions={this.functions}/>
                        <Shorts railml={true} functions={this.functions}
                                products={!!this.state.products ? [...this.state.products] : []}/>
                    </div>
                );
            }
        }
    }

    render = this.getMainRenderBody;
}

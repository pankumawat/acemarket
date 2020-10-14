class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "cart": localStorage && localStorage.getItem(MEM_KEYS.STATE_CART)
                ? JSON.parse(localStorage.getItem(MEM_KEYS.STATE_CART)) :
                {
                    quantity: {},
                    total: 0,
                    products: {}
                },
            products: [],
            product: undefined,
            page: undefined,
            query: undefined,
        }
        this.handleNavigation = this.handleNavigation.bind(this);
        this.addProductToCart = this.addProductToCart.bind(this);
        this.remProductFromCart = this.remProductFromCart.bind(this);
        this.setProducts = this.setProducts.bind(this);
        this.silentNav = this.silentNav.bind(this);
        this.getMainRenderBody = this.getMainRenderBody.bind(this);
        this.updateState = this.updateState.bind(this);
        this.handleNavigation();
    }

    setProducts = (products) => {
        if (products) {
            this.updateState({products: products});
        }
    }

    addProductToCart = (product, quantity) => {
        const cart = {...this.state.cart};
        if (!cart.quantity[product.id]) {
            cart.quantity[product.id] = Number.parseInt(quantity);
            cart.products[product.id] = {...product};
        } else {
            cart.quantity[product.id] = cart.quantity[product.id] + Number.parseInt(quantity);
        }
        cart.total = cart.total + Number.parseInt(quantity);
        if (localStorage) {
            localStorage.setItem(MEM_KEYS.STATE_CART, JSON.stringify(cart))
        }
        this.updateState({cart: cart})
        showSuccess(`${product.name} added successfully!`);
    }

    remProductFromCart(product, quantity) {
        const cart = {...this.state.cart};
        if (cart.quantity[product.id]) {
            cart.quantity[product.id] = cart.quantity[product.id] - Number.parseInt(quantity);
            if (cart.quantity[product.id] <= 0) {
                delete cart.quantity[product.id];
                delete cart.products[product.id];
            }
            cart.total = cart.total - Number.parseInt(quantity);
            cart.total = cart.total <= 0 ? 0 : cart.total;
            if (localStorage) {
                localStorage.setItem(MEM_KEYS.STATE_CART, JSON.stringify(cart))
            }
            this.updateState({cart: cart})
        }
    }

    silentNav = (event, path) => {
        logInfo("silentNav()");
        if (!!event)
            event.preventDefault();
        silentUrlChangeTo(path || event.target.href);
        if (!this.state.page || this.state.url != path) {
            this.handleNavigation();
            this.state = {...this.state, url: path};
        }
    }

    updateState = (states, onlyThis = false) => {
        if (onlyThis)
            setTimeout(() => this.setState({...states}), 200);
        else {
            setTimeout(() => this.setState({...this.state, ...states}), 200);
        }
    }

    handleNavigation = () => {
        const page = getPageName();
        switch (page) {
            case "ROOT": {
                this.silentNav(undefined, VALID_PATHS.HOME);
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
                    console.log("Fetch new Data");
                    const stateHasQuery = !!this.state.query;
                    const areUrlAdStateQueryDifferent = !_.isEqual(this.state.query, getQueries());
                    const doNotHaveProducts = !this.state.products || this.state.products.length == 0;
                    if ((stateHasQuery && areUrlAdStateQueryDifferent) || doNotHaveProducts) {
                        console.log("Confirmed fetching new Data");
                        let url = "/products?";
                        Object.keys(queryObj).forEach(key => {
                            url = `${url}${key}=${queryObj[key]}&`
                        });
                        this.state = {...this.state, page: page};
                        makeGetCall(url, (response) => {
                            this.updateState({query: queryObj, products: [...response.data]});
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
                        makeGetCall(`/products/${queryObj.pid}`, (response) => {
                            this.updateState({page: page, product: response.data});

                            const qs = response.data.keys.reduce((a, c) => `${a}_${c}`);
                            makeGetCall(`/products/?search_strings=${qs}`, (response) => {
                                this.updateState({products: [...response.data]});
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
                        <Cart functions={this.functions} cart={{...this.cart}}/>
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
                                    <Details product={this.state.product} functions={this.props.functions}/>
                                    <hr/>
                                    <h2><u>Similar items</u></h2>
                                    <Shorts functions={this.props.functions}
                                            products={this.state.products}
                                            recommended_for={!!this.state.product ? this.state.product.id : undefined}
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
                                products={{...this.state.products}}/>
                    </div>
                );
            }
        }
    }

    functions = {
        addProductToCart: this.addProductToCart,
        remProductFromCart: this.remProductFromCart,
        setProducts: this.setProducts,
        silentNav: this.silentNav,
        updateState: this.updateState
    }

    render = this.getMainRenderBody;
}

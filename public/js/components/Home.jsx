class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.silentNav = this.silentNav.bind(this);
        this.searchQuery = this.searchQuery.bind(this);
        this.showProductDetails = this.showProductDetails.bind(this);
        this.showProductDetails();
    }

    silentNav = (event, path) => {
        console.log("silentNav()");
        if (!!event)
            event.preventDefault();
        silentUrlChangeTo(path || event.target.href);
        if (this.state.product && !getUrlPath().includes(VALID_PATHS.DETAILS) && !getQueries().pid) {
            const _state = {...this.state};
            delete _state["product"];
            if (!path)
                delete _state["query"];
            this.setState({..._state})
        }
    }

    showProductDetails = (product) => {
        if (getUrlPath().includes(VALID_PATHS.DETAILS) && getQueries().pid) {
            if (this.state.product && this.state.product.id == getQueries().pid) {
                return;
            }
            if (product) {
                setTimeout(() => {
                    this.setState({...this.state, product: product})
                }, 500);
            } else {
                makeGetCall(`/products/${getQueries().pid}`, (response) => {
                    if (response.data) {
                        this.setState({...this.state, product: response.data})
                    }
                })
            }
        } else {
            if (getUrlPath().includes(VALID_PATHS.HOME))
                this.searchQuery({});
        }
    }

    /*
     * query { key: val }
     * price_range e.g. 100_1200
     * search_strings e.g. chocolate_pastry_juice
     * rating_minimum e.g.
     * recommended
     */
    searchQuery = (queryObj) => {
        if (queryObj) {
            const _state = {...this.state, query: queryObj};
            delete _state["product"];
            this.setState({..._state});
            this.silentNav(undefined, VALID_PATHS.SEARCH);
        }
    }

    functions = {
        ...this.props.functions,
        showProductDetails: this.showProductDetails,
        searchQuery: this.searchQuery,
        silentNav: this.silentNav
    };

    render = () => {
        return (
            <div>
                <Nav incart={this.props.data.cart.total} functions={this.functions}/>
                <div className="center box">
                    {
                        (getWAI().page == "DETAILS" && getQueries().pid && this.state.product) ?
                            <ProductDetailed functions={this.functions} product={this.state.product}/> :
                            <Shorts railml={true} functions={this.functions}
                                    hide_ids={!!this.state.product ? [this.state.product.id] : []}
                                    query={this.state.query}/>
                    }
                </div>
            </div>
        )
    }
}
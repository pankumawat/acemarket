class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.silentNav = this.silentNav.bind(this);
        this.searchQuery = this.searchQuery.bind(this);
        this.showProductDetails = this.showProductDetails.bind(this);
        this.showProductDetails();
    }

    silentNav = (event) => {
        event.preventDefault();
        silentUrlChangeTo(event.target.href);
        if (this.state.product && !getUrlPath().includes(VALID_PATHS.DETAILS) && !getQueries().pid) {
            const _state = {...this.state};
            delete _state["product"];
            delete _state["query"];
            this.setState({..._state})
        }
    }

    showProductDetails = (product) => {
        if (getUrlPath().includes(VALID_PATHS.DETAILS) && getQueries().pid) {
            console.log(JSON.stringify(this.state));
            if(this.state.product && this.state.product.id == getQueries().pid) {
                return;
            }
            if (product)
                this.setState({...this.state, product: product})
            else
                makeGetCall(`/products/${getQueries().pid}`, (response) => {
                    if (response.data) {
                        this.setState({...this.state, product: response.data})
                        console.log(JSON.stringify(this.state));
                    }
                })
        } else {
            if(getUrlPath().includes(VALID_PATHS.HOME))
                this.searchQuery({});
        }
    }

    componentDidUpdate() {
        setTimeout(this.showProductDetails, 1000);
    }

    /*
     * query { key: val }
     * price_range e.g. 100_1200
     * string_keys e.g. chocolate_pastry_juice
     * rating_minimum e.g.
     * recommended
     */
    searchQuery = (queryObj) => {
        if (queryObj) {
            this.setState({...this.state, query: queryObj})
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
                        (getQueries().pid && this.state.product) ?
                            <ProductDetailed functions={this.functions} product={this.state.product}/> :
                            <Shorts railml={true} functions={this.functions} product={this.state.product}
                                    query={this.state.query}/>
                    }
                </div>
            </div>
        )
    }
}
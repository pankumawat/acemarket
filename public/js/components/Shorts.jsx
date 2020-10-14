class Shorts extends React.Component {

    // props
    // products []
    // hide_ids []
    // query { key: val }
    /*
     * price_range e.g. 100_1200
     * search_strings e.g. chocolate_pastry_juice
     * rating_minimum e.g.
     * recommended
     */
    // functions
    // railml ? class railml
    constructor(props) {
        super(props);
        this.state = {...this.props};

        this.componentDidUpdate();
        this.populateData();
    }

    populateData = () => {
        if ((!this.state.products && !this.props.products)) {
            let url = '/products?';
            //query will be a map of key value
            if (this.props.query)
                Object.keys(this.props.query).forEach(key => {
                    url = `${url}${key}=${this.props.query[key]}&`
                });
            makeGetCall(url, (response) => {
                const _state = {
                    ...this.state, products: response.data
                }
                this.setState({
                    ..._state
                });
            })
        } else if (!this.state.products) {
            this.setState({...this.state, products: this.props.products})
        }
    }

    componentDidUpdate() {
        this.populateData();
    }

    render() {
        return (
            <div className={`h400 ${this.state.railml ? "railml" : "rail"}`}>
                {this.state.products ?
                    this.state.products.map(product => ((!this.props.recommended_for || this.props.recommended_for != product.id) && (!this.state.hide_ids || this.state.hide_ids.length == 0 || !this.state.hide_ids.includes(product.id)) ?
                        <ProductShort product={product}
                                      functions={{
                                          ...this.state.functions,
                                      }}/>
                        : ''))
                    :
                    ''}
            </div>
        )
    }
}
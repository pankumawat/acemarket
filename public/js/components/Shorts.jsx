class Shorts extends React.Component {

    // props
    // products []
    // hide_ids []
    // query { key: val }
    /*
     * price_range e.g. 100_1200
     * string_keys e.g. chocolate_pastry_juice
     * rating_minimum e.g.
     * recommended
     */
    // functions
    // railml ? class railml
    constructor(props) {
        super(props);
        this.state = {...props}

        if (!this.state.products) {
            let url = '/products?';
            //query will be a map of key value
            if (this.state.query)
                Object.keys(this.state.query).forEach(key => {
                    url = `${url}${key}=${this.state.query(key)}&`
                });
            makeGetCall(url, (response) => this.setState({
                ...this.state, products: response.data
            }))
        }
    }

    render() {
        return (
            <div className={`h400 ${this.state.railml ? "railml" : "rail"}`}>
                {this.state.products ?
                    this.state.products.map(product => ((!this.state.hide_ids || this.state.hide_ids.length == 0 || !this.state.hide_ids.includes(product.id)) ?
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
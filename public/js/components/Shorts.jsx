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
        this.state = {...this.props};
        if (!this.props.products) {
            let url = '/products?';
            //query will be a map of key value
            if (this.props.query)
                Object.keys(this.props.query).forEach(key => {
                    url = `${url}${key}=${this.props.query[key]}&`
                });
            makeGetCall(url, (response) => {
                this.setState({
                    ...this.state, products: response.data
                });
            })
        }
    }

    render() {
        return (
            <div className={`h400 ${this.props.railml ? "railml" : "rail"}`}>
                {this.state.products ?
                    this.state.products.map(product => ((!this.props.hide_ids || this.props.hide_ids.length == 0 || !this.props.hide_ids.includes(product.id)) ?
                        <ProductShort product={product}
                                      functions={{
                                          ...this.props.functions,
                                      }}/>
                        : ''))
                    :
                    ''}
            </div>
        )
    }
}
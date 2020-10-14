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
        console.log("this.populateData();");
        console.dir(`this.state.products ${JSON.stringify(this.state.products)}`)
        console.log(`DECISION TO FETCH ${!this.state.products || (!!this.props.query && !this.props.products)}`)
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
        console.log("SHORTS componentDidUpdate  state " + Object.keys(this.state))
        console.log("SHORTS componentDidUpdate  props " + Object.keys(this.props))
        console.log("SHORTS componentDidUpdate  hide_ids " + (!!this.props.hide_ids ? JSON.stringify(this.props.hide_ids) : {}))
        console.log("SHORTS componentDidUpdate  query " + (!!this.props.query ? JSON.stringify(this.props.query) : {}))
        // console.log(JSON.stringify(this.state, undefined, 2))
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
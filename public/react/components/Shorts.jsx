class Shorts extends React.Component {

    // props
    // products []
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
    }

    render() {
        const hasProducts = !!this.props.products && this.props.products.length > 0;
        return (
            <div className={`h400max flex left ${!!this.props.railml ? "railml" : "rail"}`}>
                {hasProducts ?
                    this.props.products.map(product => (!this.props.recommended_for || this.props.recommended_for != product.pid) ?
                        <div className="flex-item"><ProductShort product={product}
                                      functions={{
                                          ...this.props.functions,
                                      }}/></div>
                        : '')
                    :
                    ''}
            </div>
        )
    }
}
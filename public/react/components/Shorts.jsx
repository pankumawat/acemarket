class Shorts extends React.Component {
    // railml ? class railml
    constructor(props) {
        super(props);
    }

    render() {
        const hasProducts = !!this.props.products && this.props.products.length > 0;
        return (
            <div className={`h400max left w100p ${!!this.props.railml ? "flex-multiline" : "flex"}`}>
                {hasProducts ?
                    this.props.products.map(product => (!this.props.recommended_for || this.props.recommended_for != product.pid) ?
                        <div className="flex-item margin6">
                            <ProductShort product={product}
                                          functions={{
                                              ...this.props.functions,
                                          }}/>
                        </div>
                        : '')
                    :
                    ''}
            </div>
        )
    }
}
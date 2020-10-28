class Rail extends React.Component {
    // railml ? class railml
    constructor(props) {
        super(props);
    }

    render() {
        const hasProducts = !!this.props.products && this.props.products.length > 0;
        return (
            <div className={`rail w90p scroll same-line`}>
                {hasProducts ?
                    this.props.products.map(product => (!this.props.recommended_for || this.props.recommended_for != product.pid) ?
                        <div className="rail-item">
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
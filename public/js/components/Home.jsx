class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.showProductDetails = this.showProductDetails.bind(this);
    }

    showProductDetails(product) {
        console.log('showProductDetails called')
        console.log(`product ${product.id} && getQueries().pid ${getQueries().pid} && getQueries().pid != product.id ${getQueries().pid == product.id}`)
        if (product && getQueries().pid && getQueries().pid == product.id) {
            console.log('showProductDetails called SSS')
            this.setState({...this.state, product: product})
        }
    }

    render = () => {
        return (
            <div>
                <Nav incart={this.props.data.cart.total}/>
                <div className="center box">
                    <ProductDetailed
                    functions={{...this.props.functions, showProductDetails: this.showProductDetails}}
                    product={this.state.product}/>
                </div>
            </div>
        )
    }
}
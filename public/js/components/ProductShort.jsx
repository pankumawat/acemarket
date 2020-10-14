class ProductShort extends React.Component {
    state = {
        product: this.props.product,
    }

    addToCart = (event) => {
        const et = event.target;
        et.setAttribute('disabled', true);
        setTimeout(() => et.removeAttribute('disabled'), 1000);
        this.props.functions.addProduct(this.state.product, 1);
    }

    showDetails = (event) => {
        event.target.setAttribute('disabled', true);
        silentUrlChangeTo(`${VALID_PATHS.DETAILS}?pid=${this.state.product.id}`)
        this.props.functions.showProductDetails(this.state.product);
    }

    render = () => {
        return (
            <div className="short">
                <div className="row">
                    <div className="col-md-4">
                        <img src={this.state.product.img} className="img-thumbnail h100"
                             alt="Product Image"/>
                    </div>
                    <div className="col-md-8">
                        <div className="row">
                            <div className="col-md-12">
                                <h2>{this.state.product.name}</h2>
                                <Rating rating={this.state.product.rating_number}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 overflow-auto">
                        <div className="row">
                            <div className="col-md-12">
                                {`${this.state.product.description.substr(0, 150)}${this.state.product.description.length > 150 ? '...' : ''}`}
                                <br/>
                                <button type='button' className="btn btn-info" onClick={this.showDetails}>
                                    Show Details
                                </button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <br/>
                                {this.state.product.keys.map(key => (
                                    <span className="badge badge-dark margin6 fs15">{key}</span>
                                ))}
                            </div>
                        </div>
                        <div className="row">
                            <Price price={this.state.product.price}
                                   price_without_discount={this.state.product.price_without_discount}/>
                            <div className="col-md-6">
                                <button type='button' class="btn btn-success" onClick={this.addToCart}>
                                    Add to Basket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
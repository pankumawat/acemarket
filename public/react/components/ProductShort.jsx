class ProductShort extends React.Component {
    addToBasket = (event) => {
        const et = event.target;
        et.setAttribute('disabled', true);
        setTimeout(() => et.removeAttribute('disabled'), 1000);
        this.props.functions.addProductToCart(this.props.product, 1);
    }

    showDetails = (event) => {
        event.target.setAttribute('disabled', true);
        this.props.functions.silentNav(undefined, `${VALID_PATHS.DETAILS}?pid=${this.props.product.pid}`);
    }

    render = () => {
        return (
            <div className="short">
                <div className="row">
                    <div className="col-md-4">
                        <img src={`/api/i/${this.props.product.img}`} className="img-medium"
                             alt="Product Image"/>
                    </div>
                    <div className="col-md-8">
                        <div className="row">
                            <div className="col-md-12">
                                <h2>{this.props.product.name}</h2>
                                <Rating rating={this.props.product.rating_number}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 overflow-auto">
                        <div className="row">
                            <div className="col-md-12">
                                {`${this.props.product.description.substr(0, 150)}${this.props.product.description.length > 150 ? '...' : ''}`}
                                <br/>
                                <button type='button' className="btn btn-info" onClick={this.showDetails}>
                                    Show Details
                                </button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <br/>
                                {this.props.product.keys.map(key => (
                                    <span className="badge badge-dark margin6 fs15">{key}</span>
                                ))}
                            </div>
                        </div>
                        <div className="row">
                            <Price price={this.props.product.price}
                                   price_without_discount={this.props.product.price_without_discount}/>
                            <div className="col-md-6">
                                <button type='button' class="btn btn-success" onClick={this.addToBasket}>
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
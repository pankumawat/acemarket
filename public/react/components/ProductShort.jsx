class ProductShort extends React.Component {
    addToBasket = (event) => {
        const et = event.target;
        et.setAttribute('disabled', true);
        setTimeout(() => et.removeAttribute('disabled'), 1000);
        this.props.functions.addProductToCart(this.props.product, 1);
    }

    showDetails = (event) => {
        this.props.functions.silentNav(undefined, `${VALID_PATHS.DETAILS}?pid=${this.props.product.pid}`);
    }

    render = () => {
        return (
            <div className="short h250min w300min h200max w250max vflex">
                <div className="flex-item flex h100min h100max scroll">
                    <div className="flex-item flex pointer" onClick={this.showDetails}>
                        <img src={`/api/i/${this.props.product.img}`} className="img-small flex-item w50p"
                             alt="Product Image"/>
                        <div className="flex-item w50p vscroll">
                            <h6 className="wrap">{this.props.product.name}</h6>
                            <Rating rating={this.props.product.rating_number}/>
                        </div>
                    </div>
                </div>
                <div className="flex-item w300max wrap h100max">
                    {this.props.product.keys.map(key => (
                        <span className="badge badge-dark margin6 fs15">{key}</span>
                    ))}
                </div>
                <div className="flex-item flex">
                    <div className="flex-item">
                        <Price price={this.props.product.price}
                               price_without_discount={this.props.product.price_without_discount}/>
                    </div>
                    <div className="flex-item">
                        <button type='button' class="btn btn-success" onClick={this.addToBasket}>
                            Add <i className="fal fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
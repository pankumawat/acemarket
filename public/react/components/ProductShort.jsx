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
            <div className="short h300min h300max w250min w250max vflex margin10">
                <div className="flex-item scroll pointer" onClick={this.showDetails}>
                    <div className="flex-item">
                        <img src={`/api/i/${this.props.product.img}`} className="rail-image margin-auto w250min w250max h200max"
                             alt="Product Image"/>
                    </div>
                    <div className="flex-item rail-item-name">
                        <h6 className="ellipsis">{this.props.product.name}</h6>
                        <Rating rating={this.props.product.rating_number}/>
                    </div>
                </div>
                <div className="flex-item w300max wrap scroll h100max rail-item-key">
                    {this.props.product.keys.splice(0,3).map(key => (
                        <span className="badge badge-dark margin6 fs15">{key}</span>
                    ))}
                </div>
                <div className="flex-item flex rail-item-footer">
                    <div className="flex-item">
                        <Price price={this.props.product.price}
                               price_without_discount={this.props.product.price_without_discount}/>
                    </div>
                    <div className="flex-item float-right">
                        <button type='button' class="btn btn-success h40max h40min" onClick={this.addToBasket}>
                            Add <i className="fa fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
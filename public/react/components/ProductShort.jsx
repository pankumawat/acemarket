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
                        <h5 className="wrap">{ellipsis(this.props.product.name, 50)}</h5>
                        <Rating rating={4 || this.props.product.rating_number}/>
                    </div>
                </div>
                <div className="rail-item-footer flex-between">
                    <div className="flex-item center">
                        <Price shortPrice="true"
                               price={this.props.product.price}
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
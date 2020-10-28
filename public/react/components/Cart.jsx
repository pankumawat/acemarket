class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cart: this.props.cart,
            data: undefined
        }
        this.fetchCartDetails = this.fetchCartDetails.bind(this);
        this.quantityUpdate = this.quantityUpdate.bind(this);
        this.fetchCartDetails();
    }

    quantityUpdate = (event) => {
        event.preventDefault();

        let elem = event.target.getAttributeNames().includes("role") ? event.target : event.target.parentElement;
        const pid = elem.getAttribute("data_pid");
        const role = elem.getAttribute('role');
        switch (role) {
            case "plus":
                this.props.functions.addProductToCart(this.state.cart.products[pid], 1);
                break;
            case "minus":
                this.props.functions.remProductFromCart(this.state.cart.products[pid], 1);
                break;
            case "remove":
                this.props.functions.remProductFromCart(this.state.cart.products[pid], this.props.cart.quantity[pid]);
                break;
            default:
                showError("Something went wrong. " + elem);
        }
    }

    fetchCartDetails = () => {
        const pids = [];
        const mids = [];
        Object.keys(this.props.cart.products).forEach(pid => {
            const mid = this.props.cart.products[pid].mid;
            if (!pids.includes(pid))
                pids.push(pid);
            if (!mids.includes(mid))
                mids.push(mid);
        })
        const pidsStr = pids.reduce((pid, cid) => `${pid}_${cid}`);
        const midsStr = mids.reduce((pid, cid) => `${pid}_${cid}`);
        makeGetCall(`/api/data/cart?pids=${pidsStr}&mids=${midsStr}`, (response) => {
            this.setState({...this.state, data: {...response.data}})
        });
    }

    render = () => {
        if (this.props.cart.total <= 0) {
            return (
                <div className="row margin36">
                    <div className="col-md-12">
                        <div className="col-sm-12 empty-cart-cls text-center">
                            <h3><strong>Your Basket is Empty</strong></h3>
                            <h4>Add something to make me happy :)</h4>
                            <a href={VALID_PATHS.HOME}
                               className="btn btn-primary cart-btn-transform m-3"
                               data-abc="true" onClick={this.props.functions.silentNav}>continue shopping</a>
                        </div>
                    </div>
                </div>
            )
        } else
            return (
                <div className="container-fluid margin20">
                    <div className="row">
                        <div className="col-md-12">
                            <h2>My Basket</h2>
                            <table className="table ">
                                <tbody className="align-middle">
                                {
                                    (!!this.state.data) ?
                                        (
                                            Object.keys(this.props.cart.products).map(pid => {
                                                    const product = this.state.data.products[pid];
                                                    const merchant = this.state.data.merchants[product.mid];
                                                    product["merchant"] = {...merchant};
                                                    product["cart_quantity"] = this.props.cart.quantity[product.pid];
                                                    product["cart_total_price"] = product.price * product.cart_quantity;
                                                    return (
                                                        <tr>
                                                            <td className="w30p">
                                                                <div className="flex">
                                                                    <img src={`/api/i/${product.img}`}
                                                                         className="img-small flex-item"
                                                                         alt="Product Image" onClick={() => {
                                                                        this.props.functions.silentNav(undefined, `${VALID_PATHS.DETAILS}?pid=${product.pid}`);
                                                                    }}/>
                                                                    <div className="flex-item h50min scroll">
                                                                        <h5 className="wrap">{product.name}</h5>
                                                                        <Rating rating={product.rating_number}/>
                                                                        <Price price={product.price}
                                                                               price_without_discount={product.price_without_discount}/>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="w25p">
                                                                <div className="row">
                                                                    <div className="col-md-4">
                                                                        <img
                                                                            src={`/api/i/${product.merchant.logo_img}`}
                                                                            className="img-small"
                                                                            alt="Product Image"/>
                                                                    </div>
                                                                    <div className="col-md-8">
                                                                        <div className="row">
                                                                            <div className="col-md-12">
                                                                                <h5>{product.merchant.name}</h5>
                                                                                {!!product.merchant.contact_no ?
                                                                                    <b>{product.merchant.contact_no}<br></br></b> : ''}
                                                                                {!!product.merchant.email ?
                                                                                    <b>{product.merchant.email}<br></br></b> : ''}
                                                                                <h6><u>{product.merchant.fullname}</u></h6>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="fs25 w20p">
                                                                <div className="row">
                                                                    <div className="col-md-2"> {
                                                                        product.cart_quantity > 1 ?
                                                                            <a href="#" role="minus" data_pid={product.pid}
                                                                               onClick={this.quantityUpdate}><i
                                                                                className="fa fa-minus-square"/></a>
                                                                            :
                                                                            <i className="fa fa-minus-square grey"/>
                                                                    }
                                                                    </div>
                                                                    <div className="col-md-2">
                                                                        {product.cart_quantity}
                                                                    </div>
                                                                    <div className="col-md-2">
                                                                        <a href="#" role="plus" data_pid={product.pid}
                                                                           onClick={this.quantityUpdate}><i
                                                                            className="fa fa-plus-square"/></a>
                                                                    </div>
                                                                    <div className="col-md-6" data-toggle="tooltip"
                                                                         data-placement="top"
                                                                         title="Remove item from cart.">
                                                                        <a href="#" role="remove" data_pid={product.pid}
                                                                           onClick={this.quantityUpdate}><i
                                                                            className="far fa-trash-alt orange"/></a>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="fs20 w25p">
                                                                {
                                                                    !!product.cart_total_price && product.cart_total_price > 0
                                                                        ?
                                                                        `${product.cart_total_price} (₹)`
                                                                        :
                                                                        'Price on enquiry.'
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            )
                                        )
                                        :
                                        <tr/>
                                }
                                <tr>
                                    <td/>
                                    <td/>
                                    <td className="fs25">Total Amount:</td>
                                    <td className="fs25 w50">
                                        {
                                            !!this.state.data ?
                                                Object.keys(this.props.cart.products).map(pid => {
                                                    const product = this.state.data.products[pid];
                                                    return ((product.price > 0 ? product.price : 0) * this.props.cart.quantity[pid])
                                                }).reduce((p, c) => p + c)
                                                :
                                                '0'
                                        } (₹)
                                        <br/>
                                        <h6 className="w200max"><span className="red">*</span>Does not include the
                                            products with non disclosed
                                            prices.</h6>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )
    }
}
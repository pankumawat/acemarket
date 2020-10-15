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
        const id = elem.getAttribute("data_id");
        const role = elem.getAttribute('role');
        switch (role) {
            case "plus":
                this.props.functions.addProductToCart(this.state.cart.products[id], 1);
                break;
            case "minus":
                this.props.functions.remProductFromCart(this.state.cart.products[id], 1);
                break;
            case "remove":
                this.props.functions.remProductFromCart(this.state.cart.products[id], this.props.cart.quantity[id]);
                break;
            default:
                showError("Something went wrong. " + elem);
        }
    }

    fetchCartDetails = () => {
        const ids = [];
        const mids = [];
        Object.keys(this.props.cart.products).forEach(id => {
            const mid = this.props.cart.products[id].mid;
            if (!ids.includes(id))
                ids.push(id);
            if (!mids.includes(mid))
                mids.push(mid);
        })
        const idsStr = ids.reduce((pid, cid) => `${pid}_${cid}`);
        const midsStr = mids.reduce((pid, cid) => `${pid}_${cid}`);
        makeGetCall(`/api/data/cart?ids=${idsStr}&mids=${midsStr}`, (response) => {
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

                            <h1>My Basket</h1>
                            <table className="table ">
                                <tbody className="align-middle">
                                {
                                    (!!this.state.data) ?
                                        (
                                            Object.keys(this.props.cart.products).map(pid => {
                                                    const product = this.state.data.products[pid];
                                                    const merchant = this.state.data.merchants[product.mid];
                                                    product["merchant"] = {...merchant};
                                                    product["cart_quantity"] = this.props.cart.quantity[product.id];
                                                    product["cart_total_price"] = product.price * product.cart_quantity;
                                                    return (
                                                        <tr>
                                                            <td>
                                                                <div className="row">
                                                                    <div className="col-md-4">
                                                                        <img src={product.img} className="img-thumbnail"
                                                                             alt="Product Image"/>
                                                                    </div>
                                                                    <div className="col-md-8">
                                                                        <h2>{product.name}</h2>
                                                                        <Rating rating={product.rating_number}/>
                                                                        <br/>
                                                                        <h5>
                                                                            {
                                                                                !!product.price && product.price > 0
                                                                                    ?
                                                                                    `${product.price} (₹)`
                                                                                    :
                                                                                    'Price on enquiry.'
                                                                            }
                                                                        </h5>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="row">
                                                                    <div className="col-md-4">
                                                                        <img
                                                                            src={product.merchant.logo_img || product.merchant.profile_img}
                                                                            className="img-thumbnail"
                                                                            alt="Product Image"/>
                                                                    </div>
                                                                    <div className="col-md-8">
                                                                        <div className="row">
                                                                            <div className="col-md-12">
                                                                                <h2>{product.merchant.name}</h2>
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
                                                            <td className="fs25">
                                                                <div className="row">
                                                                    <div className="col-md-2"> {
                                                                        product.cart_quantity > 1 ?
                                                                            <a href="#" role="minus" data_id={product.id}
                                                                               onClick={this.quantityUpdate}><i
                                                                                className="far fa-minus-square"/></a>
                                                                            :
                                                                            <i className="far fa-minus-square grey"/>
                                                                    }
                                                                    </div>
                                                                    <div className="col-md-2">
                                                                        {product.cart_quantity}
                                                                    </div>
                                                                    <div className="col-md-2">
                                                                        <a href="#" role="plus" data_id={product.id}
                                                                           onClick={this.quantityUpdate}><i
                                                                            className="far fa-plus-square"/></a>
                                                                    </div>
                                                                    <div className="col-md-6" data-toggle="tooltip"
                                                                         data-placement="top"
                                                                         title="Remove item from cart.">
                                                                        <a href="#" role="remove" data_id={product.id}
                                                                           onClick={this.quantityUpdate}><i
                                                                            className="far fa-trash-alt orange"/></a>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="fs25">
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
                                        <h6><span className="red">*</span>Do not include the products with non disclosed
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
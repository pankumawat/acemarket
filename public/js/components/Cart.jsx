class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cart: this.props.cart
        }
    }

    render = () => {
        return (
            <div className="container-fluid margin20">
                <div className="row">
                    <div className="col-md-12">
                        <table className="table table-borderless">
                            <thead>
                            <tr>
                                <th scope="col">Item</th>
                                <th scope="col">Description</th>
                                <th scope="col">Seller</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">Price (₹)</th>
                                <th scope="col">Total Price (₹)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                Object.keys(this.props.cart.products).map(pid => {
                                    const product = this.props.cart.products[pid];
                                    product["cart_quantity"] = this.props.cart.quantity[product.id];
                                    product["cart_total_price"] = product.price * product.cart_quantity;
                                    return (
                                        <tr>
                                            <td>{product.name}</td>
                                            <td>{product.description}</td>
                                            <td>{product.mid} //TODO Seller name and details..</td>
                                            <td>{product.cart_quantity}</td>
                                            <td>{product.price}</td>
                                            <td>{product.cart_total_price}</td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}
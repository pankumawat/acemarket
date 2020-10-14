class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cart: this.props.cart
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            product: (this.props.product || this.product),
            functions: this.props.functions,
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
                                <th scope="col">#</th>
                                <th scope="col">First</th>
                                <th scope="col">Last</th>
                                <th scope="col">Handle</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <th scope="row">1</th>
                                <td>Mark</td>
                                <td>Otto</td>
                                <td>@mdo</td>
                            </tr>
                            <tr>
                                <th scope="row">2</th>
                                <td>Jacob</td>
                                <td>Thornton</td>
                                <td>@fat</td>
                            </tr>
                            <tr>
                                <th scope="row">3</th>
                                <td colSpan="2">Larry the Bird</td>
                                <td>@twitter</td>
                            </tr>
                            </tbody>
                        </table>>
                    </div>
                </div>
            </div>
        )
    }
}
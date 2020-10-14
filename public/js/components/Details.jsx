class Details extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props,
            currentImg: (!!this.props.product && this.props.product.img),
            product: (!!this.props.product && this.props.product)
        };
    }

    setCurrentImg = (event) => {
        this.setState({...this.state, currentImg: event.target.getAttribute("src")})
    }

    addToBasket = (event) => {
        const et = event.target;
        et.setAttribute('disabled', true);
        setTimeout(() => et.removeAttribute('disabled'), 1000);
        this.props.functions.addProductToCart(this.state.product, 1);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.product)
            return true;
        if (this.state.product.id !== nextProps.product.id) {
            this.setState({
                product: nextProps.product,
                currentImg: nextProps.product.img
            })
            return false;
        } else {
            return true;
        }
    }

    render = () => {
        if (!!this.props.product)
            return (
                <div className="row">
                    <div className="col-md-1 overflow-auto h400">
                        {[this.props.product.img, ...this.props.product.imgs].map((img, key) => (<div className="row">
                            <div className="row" key={key}>
                                <div className="col-md-12" key={key}>
                                    <img src={img} className="img-fluid img-thumbnail"
                                         alt="Product Image"
                                         style={(this.state.currentImg == img) ? {border: "5px solid orange"} : {}}
                                         key={key} onClick={this.setCurrentImg}/>
                                </div>
                            </div>
                        </div>))
                        }
                    </div>
                    <div className="col-md-4">
                        <img src={this.state.currentImg} className="img-thumbnail h400"
                             alt="Product Image"/>
                    </div>
                    <div className="col-md-7">
                        <div className="row">
                            <div className="col-md-12">
                                <h2>{this.props.product.name}</h2>
                                <Rating rating={this.props.product.rating_number}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-7 overflow-auto h300">
                                <div className="row">
                                    <div className="col-md-12">
                                        {this.props.product.description}
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
                                    <div className="col-md-4">
                                        <button type='button' className="btn btn-success"
                                                onClick={this.addToBasket}>
                                            Add to basket
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-5">
                                <div className="h300 overflow-auto">
                                    <table className="table table-bordered">
                                        <tbody>
                                        {Object.keys(this.props.product.properties).map((key, index) => (
                                            <tr key={index + 'tr'}>
                                                <th className="right p-1" key={index + 'th'}>{key}</th>
                                                <td className="left p-1"
                                                    key={index + 'td'}>{this.props.product.properties[key]}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        else
            return <div/>
    }
}
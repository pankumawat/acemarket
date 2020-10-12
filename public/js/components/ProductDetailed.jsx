class ProductDetailed extends React.Component {
    product = {
        "mid": "0",
        "id": "100",
        "name": "Roger's special",
        "description": "An awesome cake with Roger's name on it. An awesome cake with Roger's name on it. An awesome cake with Roger's name on it. An awesome cake with Roger's name on it. An awesome cake with Roger's name on it. An awesome cake with Roger's name on it. An awesome cake with Roger's name on it. An awesome cake with Roger's name on it. An awesome cake with Roger's name on it.",
        "keys": [
            "cake",
            "pastry",
            "chocolate",
            "birthday"
        ],
        "img": "https://hpbd.name/uploads/w450/2020/08/04/two-tier-birthday-cake-with-name-and-photo-1_309ce.jpg",
        "imgs": [
            "https://hpbd.name/uploads/w450/2020/08/19/happy-anniversary-cake-with-photo-frame-banner_8d11a.jpg",
            "https://hpbd.name/uploads/w450/2019/11/09/flower-birthday-cake-with-photo-frame5dc670f737cfa_e1ba8c819d3dd515185ed91349ca1099.jpg",
            "https://hpbd.name/uploads/w450/2019/09/10/romantic-heart-love-cake-with-name-and-photo-frame-min5d774e86c49e1_7f75c3039e5e0faed1baa0f808fcdd48.jpg"
        ],
        "properties": {
            "Type": "Chocolate cake",
            "Occassion": "Birthday",
            "Color": "Black",
            "Weight": "1 kg.",
            "Type1": "Chocolate cake",
            "Occassion1": "Birthday",
            "Color1": "Black",
            "Weight1": "1 kg."
        },
        "addedDt": 1602127322991,
        "modifiedDt": 1602127322991,
        "price": 1200,
        "currency": "INR",
        "rating": {
            "1": 200,
            "2": 6,
            "3": 12,
            "4": 120,
            "5": 70
        },
        "rating_number": 4.5,
        "sold_units": 89,
        "price_without_discount": 1400
    }

    constructor(props) {
        super(props);
        console.log(`******* this.props.product ${this.props.product}`);
        if (this.props.product)
            console.log("Opened with " + this.props.product.id);
        this.state = {
            product: (this.props.product || this.product),
            imgs: [this.product.img, ...this.product.imgs],
            currentImg: this.product.img,
            suggestedProducts: []
        }
        this.loadSuggestedProducts();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.product)
            return true;
        if (!this.state.product || nextState.product.id !== nextProps.product.id) {
            this.setState({
                product: nextProps.product,
                imgs: [nextProps.product.img, ...nextProps.product.imgs],
                currentImg: nextProps.product.img,
                suggestedProducts: []
            })
            this.loadSuggestedProducts();
            // Since we called setState, we are sure that shouldComponentUpdate will be called again, so we will rerender at that time.
            return false;
        } else {
            return true;
        }
    }

    setCurrentImg = (event) => {
        this.setState({...this.state, currentImg: event.target.getAttribute("src")})
    }

    addToCart = () => {
        this.props.functions.addProduct(this.state.product, 1);
    }

    loadSuggestedProducts = () => {
        console.log("this.loadSuggestedProducts();");
        const _keys = this.state.product.keys.reduce((a, c) => `${a}_${c}`)
        fetch(`/products?string_keys=${_keys}`).then((response) => response.json()).then((response) => {
            if (response.success) {
                this.setState({
                    ...this.state,
                    suggestedProducts: [...response.data, ...response.data, ...response.data]
                })
            } else {
                showError(`Something went wrong while fetching recommendations. ${response.error}`, 3000);
            }
        }).catch((error) => {
            showError(`Something went wrong while fetching recommendations. ${error}`, 3000);
        });
    }

    render = () => {
        return (
            <div className="container-fluid" style={{margin: "20px"}}>
                <div className="row">
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-1 overflow-auto h400">
                                {this.state.imgs.map((img, key) => (<div className="row">
                                    <div className="row" key={key}>
                                        <div className="col-md-12" key={key}>
                                            <img src={img} className="img-fluid img-thumbnail"
                                                 alt="Product Image"
                                                 style={this.state.currentImg == img ? {border: "5px solid orange"} : {}}
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
                                        <h2>{this.product.name}</h2>
                                        <span className="fas fa-star"
                                              style={{color: this.product.rating_number > 0.5 ? "orange" : "grey"}}/>
                                        <span className="fas fa-star"
                                              style={{color: this.product.rating_number > 1.5 ? "orange" : "grey"}}/>
                                        <span className="fas fa-star"
                                              style={{color: this.product.rating_number > 2.5 ? "orange" : "grey"}}/>
                                        <span className="fas fa-star"
                                              style={{color: this.product.rating_number > 3.5 ? "orange" : "grey"}}/>
                                        <span className="fas fa-star"
                                              style={{color: this.product.rating_number > 4.5 ? "orange" : "grey"}}/>
                                        <span> {this.product.rating_number}</span>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-7 overflow-auto h300">
                                        <div className="row">
                                            <div className="col-md-12">
                                                {this.product.description}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <hr/>
                                                {this.product.keys.map(key => (
                                                    <button type='button' className='btn btn-info'
                                                            style={{margin: "5px"}}
                                                            disabled>{key}</button>
                                                ))}
                                                <hr/>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-8"
                                                 style={{"font-size": "30px"}}>
                                                <div>{this.product.price_without_discount ?
                                                    <s className="text-danger">₹{this.product.price_without_discount}</s> : ''}
                                                    <b className="text-info">&nbsp;&nbsp;{this.product.price ? `₹${this.product.price}  ` : ''}</b>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <button type='button' className="btn btn-success"
                                                        onClick={this.addToCart}>
                                                    Add to basket
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-5">
                                        <div className="h300 overflow-auto">
                                            <table className="table table-bordered">
                                                <tbody>
                                                {Object.keys(this.product.properties).map(key => (
                                                    <tr>
                                                        <th className="right p-1">{key}</th>
                                                        <td className="left p-1">{this.product.properties[key]}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr/>
                        <h2><u>Similar items</u></h2>
                        <div className="row horizontal-scrollable text-center" style={{width: "100%"}}>
                            {this.state.suggestedProducts ?
                                this.state.suggestedProducts.map(product => (true || product.id !== this.state.product.id ?
                                    <div className="col-xs-4"><ProductShort product={product}
                                                                            functions={{
                                                                                ...this.props.functions,
                                                                                showProductDetailsPage: this.showProductDetailsPage
                                                                            }}/>
                                    </div> : ''))
                                :
                                ''}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
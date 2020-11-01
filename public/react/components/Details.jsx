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
        const src = event.target.getAttribute("src");
        const fileName = src.substr(src.lastIndexOf('/') + 1);
        this.setState({...this.state, currentImg: fileName})
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
        if (this.state.product.pid !== nextProps.product.pid) {
            this.setState({
                product: nextProps.product,
                currentImg: nextProps.product.img
            })
            return false;
        } else {
            return true;
        }
    }

    getImgsList = () => {
        const imgs = [this.props.product.img];
        if (!!this.props.product.imgs && this.props.product.imgs.length > 0)
            imgs.push(...this.props.product.imgs)
        return imgs;
    }

    getImagesPanel = () => (
        <div className="flex-item vscroll vflex w20p w150max w100min h450max">
            {this.getImgsList().map((img, key) => (
                <img src={`/api/i/${img}`} className="img-small flex-item" key={key}
                     alt="Product Image"
                     style={(this.state.currentImg == img) ? {"box-shadow": "10px 5px 10px grey"} : {}}
                     key={key} onClick={this.setCurrentImg}/>))
            }
        </div>
    )

    render = () => {
        if (!!this.props.product)
            return (
                <div className="flex h450min h450max">
                    {this.getImagesPanel()}
                    <div className="flex-item w20p vflex w300min">
                        <img src={`/api/i/${this.state.currentImg}`} className="img-large flex-item"
                             alt="Product Image"/>
                        <div className="flex-item">
                            <Price price={this.props.product.price}
                                   price_without_discount={this.props.product.price_without_discount}/>
                        </div>
                    </div>
                    <div className="flex-item w30p vflex w300min">
                        <div className="flex-item vscroll h50min h100max">
                            <h4 className="wrap">{this.props.product.name} {this.props.product.name} {this.props.product.name}</h4>
                        </div>
                        <Rating rating={this.props.product.rating_number}/>
                        <div className="vscroll flex-item h300max">
                            {this.props.product.description}
                        </div>
                        <div className="flex-item flex">
                            <div className="flex-item w90p h100max vscroll">
                                {this.props.product.keys.map(key => (
                                    <span className="badge badge-dark margin6 fs15">{key}</span>
                                ))}
                            </div>
                            <button type='button' className="w100min flex-item btn btn-success h40max h40min"
                                    onClick={this.addToBasket}>
                                Add <i className="fa fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>

                    <div className="flex-item vscroll h300min h500max w200min">
                        <table className="table table-bordered">
                            <tbody>
                            {!!this.props.product.properties ? Object.keys(this.props.product.properties).map((key, index) => (
                                <tr key={index + 'tr'}>
                                    <th className="p-1" key={index + 'th'}>{key}</th>
                                    <td className="p-1"
                                        key={index + 'td'}>{this.props.product.properties[key]}</td>
                                </tr>
                            )) : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        else
            return <div/>
    }
}
class ProductDetailed extends React.Component {
    product = {
        "mid": "0",
        "pid": "100",
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
        this.state = {
            product: (this.props.product || this.product),
            functions: this.props.functions,
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextProps.product)
            return true;
        if (!!nextProps.product && this.state.product.pid !== nextProps.product.pid) {
            this.setState({
                product: nextProps.product
            })
            return false;
        } else {
            return true;
        }
    }

    render = () => {
        return (
            <div className="container-fluid margin20">
                <div className="row">
                    <div className="col-md-12">
                        <Details product={this.state.product} functions={this.props.functions}/>
                        <hr/>
                        <h2><u>Similar items</u></h2>
                        <Shorts functions={this.props.functions}
                                query={{"search_strings": this.state.product.keys.reduce((a, c) => `${a}_${c}`)}}
                                recommended_for={this.state.product.pid}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
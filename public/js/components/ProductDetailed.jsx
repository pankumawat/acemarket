class ProductDetailed extends React.Component {
    heightClass = "h400";
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
            "Weight1": "1 kg.",
            "Type2": "Chocolate cake",
            "Occassion2": "Birthday",
            "Color2": "Black",
            "Weight2": "1 kg.",
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
    state = {
        product: this.product,
        imgs: [this.product.img, ...this.product.imgs],
        currentImg: this.product.img
    }


    setCurrentImg = (event) => {
        this.setState({...this.state, currentImg: event.target.getAttribute("src")})
    }

    render = () => {
        console.dir(this.state);
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
                            <div className="col-md-5">
                                <img src={this.state.currentImg} className="img-thumbnail h400"
                                     alt="Product Image"/>
                            </div>
                            <div className="col-md-6">
                                <div className="row ">
                                    <div className="col-md-12">
                                        <h2>{this.product.name}</h2>
                                        <span
                                            className={this.product.rating_number > 0.5 ? "fa fa-star star-filled" : "fa fa-star"}/>
                                        <span
                                            className={this.product.rating_number > 1.5 ? "fa fa-star star-filled" : "fa fa-star"}/>
                                        <span
                                            className={this.product.rating_number > 2.5 ? "fa fa-star star-filled" : "fa fa-star"}/>
                                        <span
                                            className={this.product.rating_number > 3.5 ? "fa fa-star star-filled" : "fa fa-star"}/>
                                        <span
                                            className={this.product.rating_number > 4.6 ? "fa fa-star star-filled" : "fa fa-star"}/>
                                        <span> {this.product.rating_number}</span>
                                    </div>
                                </div>
                                <div className="row ">
                                    <div className="col-md-6 overflow-auto h100">{this.product.description}</div>
                                    <div className="col-md-6">
                                        <div className="h300 overflow-auto">
                                            <table className="table" style={{"overflow-x": "scroll"}}>
                                                <tbody>
                                                {Object.keys(this.product.properties).map(key => (
                                                    <tr>
                                                        <th className="right">{key}</th>
                                                        <td className="left">{this.product.properties[key]}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        {this.product.keys.map(key => (
                                            <button type='button' className='btn btn-info' style={{margin: "5px"}}
                                                    disabled>{key}</button>))}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
class ProductShort extends React.Component {
    state = {
        product: this.props.product,
    }

    render = () => {
        console.dir(this.state);
        return (
            <div className="container-fluid h400 w400" style={{margin: "10px", "border-style": "dotted"}}>
                <div className="row">
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-4">
                                <img src={this.state.product.img} className="img-thumbnail h100"
                                     alt="Product Image"/>
                            </div>
                            <div className="col-md-8">
                                <div className="row">
                                    <div className="col-md-12">
                                        <h2>{this.state.product.name}</h2>
                                        <span className="fas fa-star"
                                              style={{color: this.state.product.rating_number > 0.5 ? "orange" : "grey"}}/>
                                        <span className="fas fa-star"
                                              style={{color: this.state.product.rating_number > 1.5 ? "orange" : "grey"}}/>
                                        <span className="fas fa-star"
                                              style={{color: this.state.product.rating_number > 2.5 ? "orange" : "grey"}}/>
                                        <span className="fas fa-star"
                                              style={{color: this.state.product.rating_number > 3.5 ? "orange" : "grey"}}/>
                                        <span className="fas fa-star"
                                              style={{color: this.state.product.rating_number > 4.5 ? "orange" : "grey"}}/>
                                        <span> {this.state.product.rating_number}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 overflow-auto">
                                <div className="row">
                                    <div className="col-md-12">
                                        {`${this.state.product.description.substr(0, 150)}${this.state.product.description.length > 150 ? '...' : ''}`}
                                        <buttom type='button' className="btn btn-info">
                                            Details
                                        </buttom>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <hr/>
                                        {this.state.product.keys.map(key => (
                                            <button type='button' className='btn btn-info'
                                                    style={{margin: "5px"}}
                                                    disabled>{key}</button>
                                        ))}
                                        <hr/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6" style={{"font-size": "30px", "font-family": "Helvetica"}}>
                                        {this.state.product.price && Number.isInteger(this.state.product.price) && parseInt(this.state.product.price) > 0 ?
                                            <div>{this.state.product.price_without_discount ?
                                                <s className="text-danger">₹{this.state.product.price_without_discount}</s> : ''}
                                                <b className="text-info">&nbsp;&nbsp;{this.state.product.price ? `₹${this.state.product.price}  ` : ''}</b>
                                            </div>
                                            :
                                            <b className="text-info" style={{"font-size": "20px"}}>Price on enquiry</b>}
                                    </div>
                                    <div className="col-md-6">
                                        <buttom type='button' class="btn btn-success">
                                            Add to basket
                                        </buttom>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
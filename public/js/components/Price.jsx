const Price = (props) => {
    // props
    // price
    // price_without_discount
    return (
        <div className="col-md-6 fs30">
            {props.price && Number.isInteger(props.price) && parseInt(props.price) > 0 ?
                <div>{props.price_without_discount ?
                    <s className="text-danger">₹{props.price_without_discount}</s> : ''}
                    <b className="text-info">&nbsp;&nbsp;{props.price ? `₹${props.price}  ` : ''}</b>
                </div>
                :
                <b className="text-info fs20">Price on enquiry</b>}
        </div>
    )
}
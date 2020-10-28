const Price = (props) => {
    // props
    // price
    // price_without_discount
    return (
        <div className="fs25">
            {props.price && Number.isInteger(props.price) && parseInt(props.price) > 0 ?
                <div>{props.price_without_discount && (props.price_without_discount > props.price) ?
                    <s className="grey">₹{props.price_without_discount}</s> : ''}
                    <b className="grey-dark">&nbsp;&nbsp;{props.price ? `₹${props.price}  ` : ''}</b>
                </div>
                :
                'Price on enquiry'}
        </div>
    )
}
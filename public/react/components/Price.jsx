const Price = (props) => {
    // props
    // price
    // price_without_discount
    return (
        <div className="fs20">
            {props.price && Number.isInteger(props.price) && parseInt(props.price) > 0 ?
                <div>
                    <b className="grey-dark fs25">&nbsp;&nbsp;{props.price ? `₹${props.price}` : ''}</b>
                    {props.shortPrice != true && props.price_without_discount && (props.price_without_discount > props.price) ?
                        <span>&nbsp;&nbsp;<s className="grey fs15">₹{props.price_without_discount}</s></span> : ''}
                </div>
                :
                'Price on enquiry'}
        </div>
    )
}
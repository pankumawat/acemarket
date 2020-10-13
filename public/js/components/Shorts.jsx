const Shorts = (props) => {
    // props
    // products []
    // hide_ids []
    // functions
    // railml ? class railml
    return (
        <div className={`h400 ${props.railml ? "railml" : "rail"}`}>
            {props.products ?
                props.products.map(product => ((!props.hide_ids || props.hide_ids.length == 0 || !props.hide_ids.includes(product.id)) ?
                    <ProductShort product={product}
                                  functions={{
                                      ...props.functions,
                                  }}/>
                    : ''))
                :
                ''}
        </div>
    )
}
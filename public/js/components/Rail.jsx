const Rail = (props) => {
    // props
    // products []
    // hide_ids []
    // functions
    return (
        <div className="h400 rail">
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
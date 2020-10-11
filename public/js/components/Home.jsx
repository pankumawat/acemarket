const Home = (props) => {
    return (
        <div>
            <Nav incart={props.data.cart.total}/>
            <div className="center box">
                {props.data.products.map(product => <ProductShort product={product}/>)}
                <ProductDetailed/>
            </div>
        </div>
    )
}
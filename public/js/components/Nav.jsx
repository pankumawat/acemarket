const Nav = (props) => {
    searchProducts = (event) => {
        if (event.which == 13) {
            props.functions.searchQuery({"search_strings": event.target.value})
        }
    }
    return (
        <div className="topnav">
            <a href={VALID_PATHS.HOME} onClick={props.functions.silentNav}>
                <strong>AceMarket.in</strong></a>
            <a className="active" href={VALID_PATHS.HOME} onClick={props.functions.silentNav}>Home</a>
            <a href={VALID_PATHS.ABOUT} onClick={props.functions.silentNav}>About</a>
            <a href={VALID_PATHS.CART} onClick={props.functions.silentNav}>Basket<sup>{props.incart > 0 ?
                <span className="badge badge-dark">{props.incart}</span> : ''}</sup></a>
            <input type="text" placeholder="Search.." onKeyUp={this.searchProducts}/>
        </div>
    )
}
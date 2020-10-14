class Nav extends React.Component {
    constructor(props) {
        super(props);
    }

    searchProducts = (event) => {
        if (event.which == 13) {
            this.props.functions.silentNav(undefined, `${VALID_PATHS.SEARCH}?search_strings=${event.target.value}`);
        }
    }

    render = () => (
        <div className="topnav">
            <a href={VALID_PATHS.HOME} onClick={this.props.functions.silentNav}>
                <strong>AceMarket.in</strong></a>
            <a className="active" href={VALID_PATHS.HOME} onClick={this.props.functions.silentNav}>Home</a>
            <a href={VALID_PATHS.ABOUT} onClick={this.props.functions.silentNav}>About</a>
            <a href={VALID_PATHS.CART} onClick={this.props.functions.silentNav}>Basket<sup>{this.props.incart > 0 ?
                <span className="badge badge-dark">{this.props.incart}</span> : ''}</sup></a>
            <input type="text" placeholder="Search.." onKeyUp={this.searchProducts}/>
        </div>
    )
}
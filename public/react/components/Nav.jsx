class Nav extends React.Component {
    constructor(props) {
        super(props);
    }

    searchProducts = (event) => {
        const backupMatch = (event.which || event.keyCode) === 13;
        if (event.key === "Enter" || backupMatch) {
            this.props.functions.silentNav(undefined, `${VALID_PATHS.SEARCH}?search_strings=${event.target.value}`);
        }
    }

    render = () => (
        <div className="topnav h50">
            <div className="topnavlogo" onClick={this.props.functions.silentNav}>
                <h1 className="topnavlogo">ACE</h1>
                <h2 className="topnavlogo">MARKET</h2>
            </div>
            <a className="active" href={VALID_PATHS.HOME} onClick={this.props.functions.silentNav}>Home</a>
            <a href={VALID_PATHS.CART} onClick={this.props.functions.silentNav}>Basket<sup>{this.props.incart > 0 ?
                <span className="badge badge-dark">{this.props.incart}</span> : ''}</sup></a>
            <input type="text" placeholder="Search.." onKeyUp={this.searchProducts}/>
            <div className="right">
                {!!getLoggedInUser() ?
                    <a className="nav-link" href={VALID_PATHS.LOGOUT}
                       onClick={this.props.functions.silentNav}>Logout</a>
                    :
                    <a className="nav-link" href={VALID_PATHS.MERCHANT_LOGIN} onClick={this.props.functions.silentNav}>Merchant
                        Login</a>
                }
            </div>
        </div>
    )
}

//<a className="dropdown-item"  href={VALID_PATHS.ADMIN_LOGIN} onClick={this.props.functions.silentNav}>Admin</a>
class AdminNav extends React.Component {
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
            <div className="topnavlogo" onClick={() => this.props.functions.silentNav(undefined, VALID_PATHS.ADMIN_HOME)}>
                <h1 className="topnavlogo">ACE</h1>
                <h2 className="topnavlogo">MARKET</h2>
            </div>
            <a className="active" href={VALID_PATHS.ADMIN_HOME} onClick={this.props.functions.silentNav}>Home</a>
            <input type="text" placeholder="Search.." onKeyUp={this.searchProducts}/>
            <div className="right">
                <a className="dropdown-item"  href={VALID_PATHS.LOGOUT} onClick={this.props.functions.silentNav}>Logout</a>
            </div>
        </div>
    )
}
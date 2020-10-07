const quiteRedirect = (event) => {
    event.preventDefault();
    silentUrlChangeTo(event.target.href);
}

const Nav = (props) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark static-top">
            <div className="container">
                <a className="navbar-brand" href={VALID_PATHS.HOME} onClick={quiteRedirect}>
                    <div className="logo" style={{display: "inline"}}></div>
                    <div style={{display: "inline", color: "#00CC00", "font-size": "20px"}}><strong>www.qlinks.in</strong></div>
                </a>
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item nav-link">
                        Hi {props.loggedInUser.user.username}
                    </li>
                </ul>
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item active">
                        <a className="nav-link" href={VALID_PATHS.HOME} onClick={quiteRedirect}>
                            Home
                            <span className="sr-only">(current)</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href={VALID_PATHS.LOGOUT} onClick={props.logout}>Logout</a>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
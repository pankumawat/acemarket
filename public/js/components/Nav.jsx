const quiteRedirect = (event) => {
    event.preventDefault();
    silentUrlChangeTo(event.target.href);
}

const Nav = (props) => {
    searchProducts = (event) => {
        if (event.which == 13) {
            alert("You've entered: " + event.target.value);
        }
    }
    return (
        <div className="topnav">
            <a href="#home">
                <strong>AceMarket.in</strong></a>
            <a className="active" href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#cart">Cart<sup>{props.incart > 0 ? <span className="badge badge-dark">{props.incart}</span> : ''}</sup></a>
            <input type="text" placeholder="Search.." onKeyUp={this.search}/>
        </div>
    )
}
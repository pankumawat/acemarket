const Home = (props) => {
    return (
        <div>
            <Nav logout={props.logout} loggedInUser={props.loggedInUser}/>
            <div className="center box">
                <Shortener loggedInUser={props.loggedInUser}/>
            </div>
        </div>
    )
}
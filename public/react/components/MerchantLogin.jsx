class MerchantLogin extends React.Component {
    constructor(props) {
        super(props);
        if (isMerchantLoggedIn()) {
            this.props.functions.silentNav(undefined, VALID_PATHS.MERCHANT_HOME);
        }
    }

    login = (event) => {
        event.preventDefault();
        const loginForm = event.target;
        const username = loginForm.elements.namedItem("username").value;
        const password = loginForm.elements.namedItem("password").value;

        makePostCall('/api/m/login', {
            username,
            password
        }, (response) => {
            const loggedInUser = response.data
            localStorage.setItem(MEM_KEYS.ACEM_USER, JSON.stringify(loggedInUser));
            showSuccess('Login successful.', 1000);
            setTimeout(() => {
                this.props.functions.loginSuccess(loggedInUser);
                this.props.functions.silentNav(undefined, VALID_PATHS.MERCHANT_HOME);
            }, 1000);
        })
    }

    render() {
        return (
            <form className="login" id="login_form" onSubmit={this.login}>
                <div className="right">
                    <a href={VALID_PATHS.HOME} onClick={this.props.functions.silentNav} className="white">Go Home</a>
                </div>
                <div className="form-group">
                    <h3 className="white">Sign in</h3>
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <input type="text" className="form-control" name="username"
                               placeholder="Username" required="required"/>
                    </div>
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <input type="password" className="form-control" name="password"
                               placeholder="Password" required="required"/>
                    </div>
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <button type="submit" className="btn btn-success form-control">Login</button>
                    </div>
                </div>
            </form>
        )
    }
}
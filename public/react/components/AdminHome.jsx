class AdminHome extends React.Component {
    render() {
        return (
            <div className="div-form w80p">
                <div className="center w100p">
                    <h1>
                        Merchant Registration
                    </h1>
                    <br/>
                </div>
                <form id="merchant-new">
                    <fieldset>
                        <legend>Login Fields</legend>
                        <div className="flex">
                            <input type="text" className="flex-item w30p" name="username" placeholder="Username"/>
                            <input type="email" className="flex-item w70p" name="email" placeholder="Email"/>
                        </div>
                    </fieldset>
                    <br/>
                    <fieldset>
                        <legend>Merchant Indentity</legend>
                    <div className="flex">
                        <span className="fs30">@</span><input type="text" className="flex-item w20p" name="tag"
                                                              placeholder="Custom Tag"/>
                        <input type="text" className="flex-item w30p" name="name" placeholder="Name"/>
                        <input type="text" className="flex-item w50p" name="fullname" placeholder="Full Name"/>
                    </div>
                    </fieldset>
                    <br/>
                    <fieldset>
                        <legend>Contact Details</legend>
                    <div className="flex">
                        <input type="text" className="flex-item w20p" name="contact_no"
                               placeholder="Primary contact Number"/>
                        <input type="text" className="flex-item w80p" name="contact_no_others"
                               placeholder="Other contact Numbers, (Comma separated)"/>
                    </div>
                    </fieldset>
                    <br/>
                    <h5>
                        Business Address
                    </h5>
                    <div className="flex">
                        <input type="text" className="flex-item w20p" name="contact_no"
                               placeholder="Primary contact Number"/>
                        <input type="text" className="flex-item w80p" name="contact_no_others"
                               placeholder="Other contact Numbers, (Comma separated)"/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1"
                               placeholder="Password"/>
                    </div>
                    <div className="form-group form-check">
                        <input type="checkbox" className="form-check-input" id="exampleCheck1"/>
                        <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>

                <pre>
                    {JSON.stringify({
                        "_id": "5f885d1b50e80ff0993ad446",
                        "mid": 0,
                        "password": "asda123121rsfsf",
                        "address": {
                            "address_l1": "P120 - A block",
                            "address_l2": "",
                            "address_l3": "",
                            "landmark": "ACE City",
                            "city": "Greater Noida West",
                            "state": "Uttar Pradesh",
                            "pin": 201306
                        },
                        "keys": [
                            "cake",
                            "pastry",
                            "chocolate",
                            "birthday"
                        ],
                        "logo_img": "http://qlinks.in/images/logo.png",
                        "profile_img": "http://qlinks.in/images/ace_city_banner.jpg",
                        "banner_img": "http://qlinks.in/images/ace_city_banner.jpg",
                        "background_img": ""
                    }, undefined, 4)}
                </pre>
            </div>
        )
    }
}
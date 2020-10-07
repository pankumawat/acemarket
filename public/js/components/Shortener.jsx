class Shortener extends React.Component {
    getPastShorts() {
        const pastShorts = localStorage.getItem("qlinks_shorts");
        if (pastShorts) {
            try {
                return JSON.parse(pastShorts);
            } catch (error) {
                return [];
            }
        } else {
            return [];
        }
    }

    state = {
        shorts: this.getPastShorts()
    }

    createShortUrl = (event) => {
        event.preventDefault();
        const shortener_form = event.target;
        const short_name = shortener_form.elements.namedItem("short_name").value;
        const long_url = shortener_form.elements.namedItem("long_url").value;
        const guest = this.props.loggedInUser.isGuest ? true : false;

        fetch('/api/short', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                short_name,
                long_url,
                guest
            })
        }).then((response) => response.json()).then((response) => {
            if (response.success) {
                showSuccess('Wow.. Link Generated..', 1000);
                this.state.shorts.push({...response.data, expireAt: Date.now()});
                localStorage.setItem("qlinks_shorts", JSON.stringify(this.state.shorts));
                this.setState(this.state);
                shortener_form.elements.namedItem("long_url").value = "";
            } else {
                showError(response.error, 3000);
            }
        }).catch((error) => {
            showError(`Something went wrong. details: ${error}`, 3000);
        });
    }

    copyToClipboard = (event) => {
        event.preventDefault();
        event.target.select();
        event.target.setSelectionRange(0, 99999);
        document.execCommand("copy");
        showSuccess(event.target.value + " copied to clipboard.", 3000);
    }

    render = () => (
        <div className="shortener box center">
            <form class="shortener" id="shortener_form" onSubmit={this.createShortUrl}>
                <div className="form-group">
                    <div className="input-group">
                    <textarea type="url" className="form-control" name="long_url"
                              placeholder="Long URL" required="required" rows="5"/>
                    </div>
                </div>

                <div className="form-group">
                    <div className="row">
                        <div className="col-xs-8 col-sm-8 col-md-8 col-lg-8">
                            <div className="input-group">
                                <input type="text" className="form-control" name="short_name"
                                       placeholder={`Custom short name ${this.props.loggedInUser.isGuest ? ' (Current user is not eligible)' : ''}`}
                                       required="required" disabled={this.props.loggedInUser.isGuest ? true : false}/>
                            </div>
                        </div>
                        <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                            <div className="input-group">
                                <button type="submit" className="btn btn-success form-control">Generate</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <table className="table table-dark shortener">
                <thead>
                <tr>
                    <th scope="col">Short Name</th>
                    <th scope="col">Short URL</th>
                    <th scope="col">Expiry</th>
                </tr>
                </thead>
                <tbody>
                {this.state.shorts.map(row => {
                    const expireAt = new Date(row.expireAt ? row.expireAt : Date.now());
                    expireAt.setHours(expireAt.getHours() + 30 * 24);

                    return (
                        <tr>
                            <td>{row.short_name}</td>
                            <td>
                                <input type="text" size={row.url.length + 2}
                                       style={{background: "transparent", border: "none", color: "white"}}
                                       value={row.url} width="100%" onClick={this.copyToClipboard}/>
                            </td>
                            <td>{expireAt.toISOString().split('T')[0]}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}
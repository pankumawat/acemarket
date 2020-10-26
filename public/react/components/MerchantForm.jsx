class MerchantForm extends React.Component {
    submitForm = (e) => {
        e.preventDefault();
        const form = e.target;
        if ($("#password_confirm").val() !== $("#password").val())
            showError("Password mismatch.");
        else
            $.ajax({
                url: '/api/admin/register/merchant',
                type: 'POST',
                beforeSend: function (xhr) {
                    const loggedInUser = getLoggedInUser();
                    if (!!loggedInUser) {
                        xhr.setRequestHeader("Authorization", `${loggedInUser.user.username} ${loggedInUser.accessToken}`);
                    }
                },
                data: new FormData(form),
                processData: false,
                contentType: false,
                success: (data) => {
                    if (data.success === true)
                        showSuccess("We did it");
                    else
                        showError(`Error - ${data.error}`);
                    console.dir(data);
                },
                error: (error) => {
                    showError(`Error - ${error}`);
                }
            });
    }

    render() {
        return (
            <div className="div-form w80p">
                <div className="center w100p">
                    <h1>
                        Merchant Registration
                    </h1>
                    <br/>
                </div>
                <form id="merchant-new" onSubmit={this.submitForm}>
                    <fieldset>
                        <legend>Login Fields</legend>
                        <div className="flex">
                            <span className="fs30">@</span>
                            <input type="text" className="flex-item w30p form-text-field" name="username"
                                   placeholder="Username" required/>
                            <input type="email" className="flex-item w70p form-text-field" name="email"
                                   placeholder="Email" required/>
                        </div>
                    </fieldset>
                    <br/>
                    <fieldset>
                        <legend>Merchant Indentity</legend>
                        <div className="flex">
                            <input type="text" className="flex-item w30p form-text-field" name="name" placeholder="Name"
                                   required/>
                            <input type="text" className="flex-item w50p form-text-field" name="fullname"
                                   placeholder="Registered Name" required/>
                        </div>
                    </fieldset>
                    <br/>
                    <fieldset>
                        <legend>Contact Details</legend>
                        <div className="flex">
                            <input type="text" className="flex-item w30p form-text-field" name="contact_no"
                                   placeholder="Primary contact Number" required/>
                            <input type="text" className="flex-item w70p form-text-field" name="contact_no_others"
                                   placeholder="Other contact Numbers. [Comma separated e.g. 99xxxxxx80,0120-11111111]"
                                   required/>
                        </div>
                    </fieldset>

                    <br/>
                    <fieldset>
                        <legend>Business Address</legend>
                        <div className="flex">
                            <input type="text" className="flex-item form-text-field" name="address_line_1"
                                   placeholder="Address Line 1" required/>
                        </div>
                        <div className="flex">
                            <input type="text" className="flex-item form-text-field" name="address_line_2"
                                   placeholder="Address Line 2 (Optional)"/>
                        </div>
                        <div className="flex">
                            <input type="text" className="flex-item form-text-field" name="address_line_3"
                                   placeholder="Address Line 3 (Optional)"/>
                            <input type="text" className="flex-item form-text-field" name="landmark"
                                   placeholder="Landmark (Optional)"/>
                        </div>

                        <div className="flex">
                            <input type="text" className="flex-item form-text-field" name="city"
                                   placeholder="City" required/>
                            <input type="text" className="flex-item form-text-field" name="state"
                                   placeholder="State" required/>
                            <input type="text" pattern="[1-9][0-9]{5}" className="flex-item form-text-field" name="pin"
                                   placeholder="Pin Code (6 Digits numeric)"
                                   required/>
                        </div>
                    </fieldset>
                    <br/>
                    <fieldset>
                        <legend>Associated Words (Search assist)</legend>
                        <div className="flex">
                            <input type="text" className="flex-item w30p form-text-field" name="keys"
                                   placeholder="Associated words.  [Comma separated e.g. cake,birthday,celebration]"
                                   required/>
                        </div>
                    </fieldset>

                    <br/>
                    <fieldset>
                        <div className="flex">
                            <input type="password" minLength="6" className="flex-item form-text-field" id="password"
                                   name="password"
                                   placeholder="Password" required/>
                            <input type="password" className="flex-item form-text-field" id="password_confirm"
                                   name="password_confirm"
                                   placeholder="Confirm Password" required/>
                        </div>
                    </fieldset>

                    <br/>
                    <fieldset>
                        <div className="flex">
                            <label className="flex-item w20p">
                                Logo Image</label>
                            <input type="file" className="flex-item w80p" id="logo_img" name="logo_img" accept="image/*"
                                   onChange={previewImg}
                                   required/>
                        </div>
                        <div className="flex">
                            <div className="image-preview flex-item" id="logo_img_preview"/>
                        </div>
                    </fieldset>
                    <br/>
                    <fieldset>
                        <div className="flex">
                            <button type="submit" className="btn btn-primary flex-item">Submit</button>
                        </div>
                    </fieldset>
                </form>
            </div>
        )
    }
}
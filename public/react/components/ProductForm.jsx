class ProductForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            properties: [{key: "", value: ""}],
            requirePrice: true
        }
        this.addPropertiesPair = this.addPropertiesPair.bind(this);
        this.deletePropertiesPair = this.deletePropertiesPair.bind(this);
        this.propertiesDivs = this.propertiesDivs.bind(this);
        this.getDefaultValue = this.getDefaultValue.bind(this);
        this.getProduct = this.getProduct.bind(this);
        if (!!getQueries().pid)
            this.getProduct(getQueries().pid);
    }

    getProduct = (pid) => {
        makeGetCall(`/api/p/${pid}`, (response) => {
            if (response.success) {
                const product = response.data;
                const loggedInUser = getLoggedInUser();
                console.dir(loggedInUser);
                if (!!loggedInUser && !!loggedInUser.user && !!loggedInUser.user.mid && (loggedInUser.user.mid === product.mid)) {
                    const state = {
                        editMode: true,
                        product,
                        properties: [...Object.keys(product.properties).map(
                            (key) => {
                                return {
                                    key,
                                    value: product.properties[key]
                                }
                            }
                        ), {key: "", value: ""}],
                        requirePrice: true
                    }
                    this.setState(state);
                }
            }
        })
    }

    submitForm = (e) => {
        e.preventDefault();
        document.getElementById("product_form_register").setAttribute("disabled", "true");
        setTimeout(() => document.getElementById("product_form_register").removeAttribute("disabled"), 5000);
        const form = e.target;
        $.ajax({
            url: `/api/m/product`,
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
                    showSuccess("Success");
                else
                    showError(`Error - ${data.error}`);
            },
            error: (error) => {
                console.error(JSON.stringify(error, undefined, 2));
                showError(`Error - ${error.error}`);
            }
        });
    }

    addPropertiesPair = () => {
        const nameItems = document.getElementsByName("properties_name")
        const valueItems = document.getElementsByName("properties_value")
        const newProperties = [];
        for (let i = 0; i < nameItems.length; i++) {
            const key = nameItems[i].value;
            if (key.length > 0) {
                const value = valueItems[i].value;
                newProperties.push({
                    key, value
                });
            }
        }
        newProperties.push({key: "", value: ""});
        this.setState({...this.state, properties: [...newProperties]});
    }

    deletePropertiesPair = (event) => {
        const key = event.target.getAttribute("data-item");
        if (key) {
            const newProperties = this.state.properties.filter(item => item.key != key)
            this.setState({...this.state, properties: newProperties});
            this.force
        }
    }

    flipPriceRequirement = () => {
        this.setState({...this.state, requirePrice: !this.state.requirePrice})
    }

    getDefaultValue = (key) => {
        const val = this.state.editMode ? this.state.product[key] : '';
        return val;
    }

    propertiesDivs = () => this.state.properties.map((item, index) => {
        const isEmpty = (item.key && item.key.length > 0) ? false : true;
        const keyD = `_${index}_${item.key}`;
        return (
            <div className="flex" key={`div_${keyD}`}>
                <input type="text" className="flex-item w30p form-text-field" name="properties_name"
                       placeholder="Property e.g. weight, size, color etc."
                       defaultValue={item.key}
                       key={`i1${keyD}`}
                />
                <input type="text" className="flex-item w30p form-text-field"
                       name="properties_value"
                       placeholder="Property value e.g. 1.4KG, 16cms, red etc."
                       defaultValue={item.value}
                       key={`i2${keyD}`}
                />
                <div className="flex-item">
                    {isEmpty ?
                        <input type="button" className="margin6 btn btn-success"
                               value="&nbsp;&nbsp;Add&nbsp;&nbsp;"
                               onClick={this.addPropertiesPair}
                        />
                        :
                        <input type="button" className="margin6 btn btn-danger"
                               value="Delete"
                               data-item={item.key}
                               onClick={this.deletePropertiesPair}
                        />
                    }
                </div>
            </div>
        )
    });

    render() {
        return (
            <div className="div-form w80p">
                <div className="center w100p">
                    <h1>
                        Product {this.state.editMode ? "Modification" : "Registration"}
                    </h1>
                    <br/>
                </div>
                <form id="product-form" onSubmit={this.submitForm}>
                    {this.state.editMode ?
                        <input type="hidden" name="pid" value={this.getDefaultValue("pid")}/>
                        : ''}
                    <fieldset>
                        <legend>Product Details</legend>
                        <div className="flex">
                            <input type="text" className="flex-item w30p form-text-field" name="name"
                                   placeholder="Name"
                                   required={!this.state.editMode} defaultValue={this.getDefaultValue('name')}/>
                            {this.state.requirePrice ?
                                (<input type="number" className="flex-item w20p form-text-field" name="price"
                                        placeholder="Price (after discount)"
                                        defaultValue={this.getDefaultValue('price')}
                                        required={!this.state.editMode}
                                        key="sp"
                                />) : (<input type="number" className="flex-item w20p" name="price"
                                              placeholder="NA"
                                              defaultValue=''
                                              key="sp"
                                              disabled
                                />)}
                            {this.state.requirePrice ?
                                (<input type="number" className="flex-item w30p form-text-field"
                                        name="price_without_discount" placeholder="Price (before discount)"
                                        defaultValue={this.getDefaultValue('price_without_discount')}
                                        key="op"
                                />) : (<input type="number" className="flex-item w30p borderless"
                                              name="price_without_discount" placeholder="NA"
                                              defaultValue=''
                                              key="op"
                                              disabled
                                />)}
                            <input type="button" className="flex-item w150min btn btn-info pointer"
                                   value={this.state.requirePrice ? "Don't show price" : "Show price"}
                                   onClick={this.flipPriceRequirement}/>
                        </div>
                        <div className="flex">
                            <textarea className="flex-item form-text-field" name="description"
                                      placeholder="Product Description"
                                      defaultValue={this.getDefaultValue('description')}
                                      required={!this.state.editMode}/>
                        </div>
                    </fieldset>
                    <br/>
                    <fieldset>
                        <legend>Associated Words (Search assist)</legend>
                        <div className="flex">
                            <input type="text" className="flex-item w30p form-text-field" name="keys"
                                   placeholder="Associated words.  [Comma separated e.g. cake,birthday,celebration]"
                                   defaultValue={[...this.getDefaultValue('keys')].join(',')}
                                   required={!this.state.editMode}/>
                        </div>
                    </fieldset>
                    <br/>
                    <fieldset className="properties-container">
                        <legend>Product Properties/Attributes (e.g. weight, size etc.)</legend>
                        {this.propertiesDivs()}
                    </fieldset>
                    <br/>
                    <fieldset>
                        <legend>Product Images</legend>
                        <div className="flex">
                            <label className="flex-item w20p">
                                Product Primary Image</label>
                            <input type="file" className="flex-item w80p" id="img" name="img" accept="image/*"
                                   onChange={previewImg}
                                   required={!this.state.editMode}/>
                        </div>
                        <div className="flex">
                            <div className="image-preview flex-item" id="img_preview">
                                {this.state.editMode ?
                                    <img src={`/api/i/${this.getDefaultValue('img')}`}
                                         height="120px" className="image-preview"/>
                                    : ''
                                }
                            </div>
                        </div>

                        <div className="flex">
                            <label className="flex-item w20p">
                                Other Images (Multiple)</label>
                            <input type="file" className="flex-item w80p" id="imgs" name="imgs" accept="image/*"
                                   onChange={previewImg}
                                   multiple
                            />
                        </div>
                        <div className="flex">
                            <div className="image-preview flex-item" id="imgs_preview">
                                {this.state.editMode ?
                                    this.getDefaultValue('imgs').map(img => <img src={`/api/i/${img}`}
                                                                                 height="120px"
                                                                                 className="image-preview"/>)
                                    : ''
                                }
                            </div>
                        </div>
                    </fieldset>

                    <br/>
                    <fieldset>
                        <div className="flex">
                            <button type="submit" className="btn btn-primary flex-item"
                                    id="product_form_register">Submit
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
        )
    }
}
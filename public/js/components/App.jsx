class App extends React.Component {
    constructor(props) {
        super(props);
        this.addProduct = this.addProduct.bind(this);
        this.remProduct = this.remProduct.bind(this);
        this.setProducts = this.setProducts.bind(this);
    }

    state = {
        "cart": localStorage && localStorage.getItem(MEM_KEYS.STATE_CART)
            ? JSON.parse(localStorage.getItem(MEM_KEYS.STATE_CART)) :
            {
                quantity: {},
                total: 0,
                products: {}
            },
        products: []
    }

    setProducts = (products) => {
        if (products) {
            const newState = {...this.state, products: products};
            this.setState(newState);
        }
    }

    addProduct(product, quantity) {
        const cart = {...this.state.cart};
        if (!cart.quantity[product.id]) {
            cart.quantity[product.id] = Number.parseInt(quantity);
            cart.products[product.id] = {...product};
        } else {
            cart.quantity[product.id] = cart.quantity[product.id] + Number.parseInt(quantity);
        }
        cart.total = cart.total + Number.parseInt(quantity);
        const newState = {...this.state, cart: cart};
        if (localStorage) {
            localStorage.setItem(MEM_KEYS.STATE_CART, JSON.stringify(cart))
        }
        this.setState(newState);
        showSuccess(`${product.name} added successfully!`);
    }

    remProduct(product, quantity) {
        const cart = {...this.state.cart};
        if (cart.quantity[product.id]) {
            cart.quantity[product.id] = cart.quantity[product.id] - Number.parseInt(quantity);
            if (cart.quantity[product.id] <= 0) {
                delete cart.quantity[product.id];
                delete cart.products[product.id];
            }
            cart.total = cart.total - Number.parseInt(quantity);
            cart.total = cart.total <= 0 ? 0 : cart.total;
            const newState = {...this.state, cart: cart};
            if (localStorage) {
                localStorage.setItem(MEM_KEYS.STATE_CART, JSON.stringify(cart))
            }
            this.setState(newState);
        }
    }

    functions = {
        addProduct: this.addProduct,
        remProduct: this.remProduct,
        setProducts: this.setProducts
    }

    render = () => {
        console.log(getWAI());
        if(getWAI().page == "LOGIN")
            return (<div className="box center"><div className="login margin36"><Login data={this.state} functions={this.functions}/></div></div>)
        else
            return (<Home data={this.state} functions={this.functions}/>)
    }
}
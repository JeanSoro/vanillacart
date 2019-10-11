// variable declarations

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');


//----> MAIN CART
let cart = [];

//---> BUTTONS
let buttonsDOM = [];

// getting products
class Products {
  async getProducts() {

    try {
      let result = await fetch('products.json');
      let data = await result.json();

      let products = data.items;
      products = products.map(item => {
        const {
          title,
          price
        } = item.fields;
        const {
          id
        } = item.sys;
        const image = item.fields.image.fields.file.url;
        return {
          title,
          price,
          id,
          image
        }
      })
      return products
    } catch (error) {
      console.log(error);
    }

  }

}

// ui - display products: getting all items returned from products then returning/manipulating
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(product => {
      result += `
      <!-- beginning of single product article-->
      <article class="product">
        <div class="img-container">
          <img src=${product.image} class="product-img" alt="" srcset="">
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i>
            add to cart
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
      </article>
      <!-- end of single product article-->
      `;
    });
    productsDOM.innerHTML = result;
  }

  //getting IDs for all buttons
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")]; //turn nodelist into array using spread operator
    buttonsDOM = buttons;


    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id); //check if item is in cart

      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      //if not in cart

      button.addEventListener('click', (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;

        // get single product from products' array based on ID data
        let cartItem = {
          ...Storage.getProduct(id),
          amount: 1
        };
        // add product to the cart
        cart = [...cart, cartItem];
        //save cart in local storage
        Storage.saveCart(cart)
        //set cart values(number showing above cart icon)
        this.setCartValues(cart);
        // display items currently in the cart
        this.addCartItem(cartItem)
        // show the cart
        this.showCart();
      });

    });

  }

  setCartValues(cart) {
    let tempCartTotal = 0;
    let itemsTotal = 0;

    cart.map(item => {
      tempCartTotal += item.price * item.amount; //total price shown when cart open
      itemsTotal += item.amount; //number shown next to cart icon
    })

    cartTotal.innerText = parseFloat(tempCartTotal.toFixed(2)); //total price shown when cart open
    cartItems.innerText = itemsTotal; //number shown next to cart icon
  }

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
    
    <img src=${item.image} alt="">
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>
      
      `;

    cartContent.appendChild(div);

  }

  setupAPP() {
    cart = Storage.getCart(); // do we have data in the cart from local storage?
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
    // cartOverlay.addEventListener('click', this.hideCart)

  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item))

  }

  showCart() {

    cartOverlay.classList.add('transparentBackground');
    cartDOM.classList.add('showCart');

  }

  hideCart() {
    cartOverlay.classList.remove('transparentBackground');
    cartDOM.classList.remove('showCart');
  }

  cartLogic() {

    // clear cart button
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener('click', e => {

      if (e.target.classList.contains('remove-item')) {

        let removeItem = e.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement);
        this.removeItem(id);

      } else if (e.target.classList.contains('fa-chevron-up')) {

        let cartIncreaseQuantityBtn = e.target;
        let id = cartIncreaseQuantityBtn.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        // tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        cartIncreaseQuantityBtn.nextElementSibling.innerText = tempItem.amount;


      } else if (e.target.classList.contains('fa-chevron-down')) {

        let cartDecreaseQuantityBtn = e.target;
        let id = cartDecreaseQuantityBtn.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
        } else {
          cartContent.removeChild(cartDecreaseQuantityBtn.parentElement.parentElement);
          this.removeItem(id)
          cartDecreaseQuantityBtn.previousElementSibling.innerText = tempItem.amount;
        }

      }

    });
  };

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id))

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart();

  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
    
      <i class="fas fa-shopping-cart"></i>add to cart
      
      `;

  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id)
  }

}

// local storage
class Storage {

  static saveProducts(products) { //no need to instantiate class using static methods
    localStorage.setItem("products", JSON.stringify(products)) //turn products array into string
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products')); // JSON.parse turns string into objects
    return products.find(product => product.id === id);
  }

  static saveCart(cart) { //no need to instantiate class using static methods
    localStorage.setItem("cart", JSON.stringify(cart))
  }

  // check for item in cart in local storage, if existent, return.
  // if non existent, empty array remains unchanged.
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }

}


document.addEventListener("DOMContentLoaded", () => {
  //create instances of classes
  const ui = new UI();
  const products = new Products();

  // setup application
  ui.setupAPP();

  // get all products
  products.getProducts().then(products => {

    ui.displayProducts(products);
    Storage.saveProducts(products);
  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic();
  });

});
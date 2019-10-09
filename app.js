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

//--->BUTTONS
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
            add to bag
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
    const buttons = [...document.querySelectorAll(".bag-btn")]; //nodelist into array spread operator
    buttonsDOM = buttons;


    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);

      if (inCart) {
        button.innerText = "In cart";
        button.disabled = true;
      }
      button.addEventListener('click', (e) => {
        e.target.innerText = "in Cart";
        e.target.disabled = true;

        // get product from products based on id
        let cartItem = {
          ...Storage.getProduct(id),
          amount: 1
        };
        // add product to the cart
        cart = [...cart, cartItem];
        //save cart in local storage
        Storage.saveCart(cart)
        //set cart values
        this.setCartValues(cart);
        // display cart item
        // show the cart
      });

    });

  }

  setCartValues(cart) {
    let tempCartTotal = 0;
    let itemsTotal = 0;

    cart.map(item => {
      tempCartTotal += item.price * item.amount;
      itemsTotal += item.amount;
    })

    cartTotal.innerText = parseFloat(tempCartTotal.toFixed(2)); //price shown when cart open
    cartItems.innerText = itemsTotal; //number shown next to cart icon
  }

}

// local storage
class Storage {

  static saveProducts(products) { //no need to instantiate class using static methods
    localStorage.setItem("products", JSON.stringify(products))
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products')); // turn string into objects
    return products.find(product => product.id === id);
  }

  static saveCart(cart) { //no need to instantiate class using static methods
    localStorage.setItem("cart", JSON.stringify(cart))
  }

}


document.addEventListener("DOMContentLoaded", () => {
  //create instances of classes

  const ui = new UI();
  const products = new Products();

  // get all products
  products.getProducts().then(products => {

    ui.displayProducts(products);
    Storage.saveProducts(products);
  }).then(() => {
    ui.getBagButtons()
  });

});
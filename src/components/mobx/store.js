export default class Store {
    cartItems = [];
    addCart(e){
        this.cartItems.push(e);
    }
    delCart(e){
        this.cartItems.push(e);
    }
    updateCart(e){
        this.cartItems.push(e);
    }
    get cartCount() {
        return this.reviewList.length;
    }

    get cartList() {
        return this.cartItems;
    }
    
}


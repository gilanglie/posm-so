import React from 'react';
import Odoo from "../../../../../api/Odoo";
import {Link} from 'react-router-dom';
import List from "@material-ui/core/List";
import Button from '@material-ui/core/Button';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CartIcon from '@material-ui/icons/ShoppingCart';
import NumberFormat from 'react-number-format';


var odoo = new Odoo();



class Products extends React.Component {
  constructor(props) {
    super(props); 
     
    this.state = {
      products : [],
      category : false,
      categ_id : false,
      open: false,
      setOpen: false,
      Transition: null,
      prod_num: false,
      moreBtn: false
    };

    
  };
  
  SnackbarhandleClick() {
    this.setState({
      setOpen : true
    });
  }

  SnackbarhandleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({
      setOpen : false
    });
  }
  handleClick = Transition => () => {
    this.setState({open: true, Transition});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  handleToggle(e,id){
    console.log('container')
  }
  click(e){
    console.log('click')
  }
  randomNum(){
    var firstNum = Math.floor(10000 + Math.random() * 90000);
    var secNum = Math.floor(100 + Math.random() * 900);
    var thirdNum = Math.floor(10000 + Math.random() * 90000);
    var data = firstNum + '-' + secNum + '-' + thirdNum;
    return data
  }

  componentWillMount () {
    const { category,categ_id } = this.props.location.state;

    let data = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    let setOpen = localStorage.getItem('cart') ? true : false;
    for (var i = 0; i < data.length; i++) {
        var qty = data[i].qty;
        var price = data[i].price_unit;
        var subtotal = qty * price;
        data[i].subtotal = subtotal;
    }
    let total = data.reduce((key, data) => key + data.subtotal, 0);

    let count = data.reduce((key, data) => key + parseInt(data.qty) || 0, 0);

    if(count == 0){
      setOpen = false;
    }

    this.setState({ 
      categ_id,category,
      prod_num : this.randomNum(),
      setOpen : setOpen,
      data : data,
      total : total,
      count : count,
    })
    // console.log('cart',this.state.cart_items)
    this.getProductCategory(categ_id);
  }

  getProductCategory(id){
    odoo.connect(function (err) {
        if (err) { return console.log(err); }
        var inParams = [];
        inParams.push([["categ_id", "=", id]]);
        inParams.push(["display_name", "list_price", "price", "categ_id", "taxes_id", 
                      "barcode", "default_code", "to_weight", "uom_id", "description_sale", "description", "product_tmpl_id", "tracking","product_id","image_small"]); //fields
        var params = [];
        params.push(inParams);
        odoo.execute_kw("product.product", 'search_read', params, function (err, value) {
            if (err) { return console.log(err); }
            console.log('products: ', value);
            
            let products = [...value]
            let data = [...this.state.data]
            // check product qty
            for (var i = 0; i < data.length; i++) {
              const findprod = products.find( prod => prod.id === data[i].id );
              if(findprod){
                findprod.qty = data[i].qty;
              } 
            }
            this.setState({
              products : products,
            })
        }.bind(this));
    }.bind(this));
  }

  // cart function
  addItem(item){
    let items = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    var uid = this.state.prod_num + item.id; 
    
    // add qty to products
    let products = [...this.state.products];
    const findprod = products.find( prodid => prodid.id === item.id );
    findprod.qty = 1;
    products.splice(item.index,1,findprod)

    // add storage cart

      
    items.push(
        {
          "price_unit": item.price,
          "product_id": item.id,
          "name": item.product_name,
          "qty": 1,
          "id": item.id,
          "product_name": item.product_name

        }
      // {
      //   "qty": 1,
      //   "product_name": item.product_name,
      //   "price_unit": item.price,
      //   "discount": 0,
      //   "product_id": item.id,
      //   "image_small": item.image_small,
      //   "tax_ids": [
      //     [
      //       6,
      //       false,
      //       []
      //     ]
      //   ],
      //   "id": item.id,
      //   "pack_lot_ids": [],
      //   "uid": uid,
      //   "ms_info": {
      //     "created": {
      //       "user": {
      //         "id": 1,
      //         "name": "Administrator"
      //       },
      //       "pos": {
      //         "id": 1,
      //         "name": "Main"
      //       }
      //     }
      //   }
      // }
    )

    localStorage.setItem('cart', JSON.stringify(items));

    // count total cart
    for (var i = 0; i < items.length; i++) {
      var qty = items[i].qty;
      var price = items[i].price_unit;
      var subtotal = qty * price;
      items[i].subtotal = subtotal;
    }

    let total = items.reduce((key, items) => key + items.subtotal, 0);
    let count = items.reduce((key, items) => key + parseInt(items.qty) || 0, 0);

    this.setState({ 
      total : total,
      data : items,
      count : count,
      products : products,
    })
    this.SnackbarhandleClick()

  }
  increaseQty(item){
    // update local qty
    let products = [...this.state.products];
    const findprod = products.find( prodid => prodid.id === item.id );
    findprod.qty += 1;
    products.splice(item.index,1,findprod)
    // update storage cart
    let items = JSON.parse(localStorage.getItem('cart'));
    const findqty = items.find( itemqty => itemqty.id === item.id );
    findqty.qty += 1;
    localStorage.setItem('cart', JSON.stringify(items));


    // count total cart
    for (var i = 0; i < items.length; i++) {
      var qty = items[i].qty;
      var price = items[i].price_unit;
      var subtotal = qty * price;
      items[i].subtotal = subtotal;
    }

    let total = items.reduce((key, items) => key + items.subtotal, 0);
    let count = items.reduce((key, items) => key + parseInt(items.qty) || 0, 0);

    this.setState({ 
      total : total,
      data : items,
      count : count,
      products : products,
    })
  }
  decreaseQty(item){
      // update local qty
      let products = [...this.state.products];
      const findprod = products.find( prodid => prodid.id === item.id );
      findprod.qty -= 1;
      
      var itemqty = findprod.qty
      // findprod.qty == 0 ? 
      //   findprod.qty == false :
      
      products.splice(item.index,1,findprod)
  
      // update storage cart
      let items = JSON.parse(localStorage.getItem('cart'));
      const findqty = items.find( itemqty => itemqty.id === item.id );
      
      if(itemqty != 0){
        findqty.qty -= 1;
      }else{
        items.splice(items.indexOf(findqty),1)
      }

      localStorage.setItem('cart', JSON.stringify(items));
  
      // count total cart
      for (var i = 0; i < items.length; i++) {
        var qty = items[i].qty;
        var price = items[i].price_unit;
        var subtotal = qty * price;
        items[i].subtotal = subtotal;
      }
  
      let total = items.reduce((key, items) => key + items.subtotal, 0);
      let count = items.reduce((key, items) => key + parseInt(items.qty) || 0, 0);
  
      this.setState({ 
        total : total,
        data : items,
        count : count,
        products : products,
      })

      if(count == 0){
        this.SnackbarhandleClose()
      }
  }
  // end function
  render() {
    const {
      category,
      products,
      setOpen,
      moreBtn,
    } = this.state;
    return (
      <div className="row animated slideInUpTiny animation-duration-3">
      <Link to={{pathname:"/app/pos/cart"}}>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          className="snackbar"
          open={setOpen}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.count} items | RP <NumberFormat value={this.state.total} displayType={'text'} thousandSeparator={true} /></span>}
          action={[
            <IconButton
              key="cart"
              aria-label="close"
              color="inherit"
            >
              <CartIcon />
            </IconButton>,
          ]}
        />
      </Link>

      <Typography variant="title" color="inherit" style={{
            }}><h1 className="page-title">{category}</h1></Typography>
      <List className="prod-list">
        {products.map((product, index) => (
            <ListItem >
              <div class="list-prod-img">
                <img src={ `data:image/png;base64,${product.image_small}` } alt={product.display_name}/>
              </div>
              <ListItemText className="br-break list-prod-desc" 
                  button key={product.display_name} onClick={event => this.handleToggle(event, product.id)}
                  >
                <h4>{product.display_name}</h4>
                {/* <h6>Nasi, ATL paha goreng, tahu, tempe, sambal, lalapan dan air mineral</h6> */}
                <h5>RP <NumberFormat value={product.list_price} displayType={'text'} thousandSeparator={true} /></h5>
              </ListItemText>
              {!product.qty ?
              <div className="more-btn">
              <Button className="list-prod-add" color="primary" onClick={
                event => 
                this.addItem({'id':product.id,'price':product.list_price,'product_name':product.display_name,'image_small':product.image_small,'index': index})
                }>Add + </Button>
              </div>
                : 
              <div className="more-btn">
              <Button className="list-prod-add" color="primary" onClick={
                event => 
                this.decreaseQty({'id':product.id,'price':product.list_price,'product_name':product.display_name,'image_small':product.image_small,'index': index})
                }>-</Button>
              <Typography>{product.qty}</Typography>
              <Button className="list-prod-add" color="primary" onClick={
                event => 
                this.increaseQty({'id':product.id,'price':product.list_price,'product_name':product.display_name,'image_small':product.image_small,'index': index})
                }>+</Button>
              </div>
              }
            </ListItem>
        ))}
      </List>
    </div>  
    );
  }
}

export default Products;
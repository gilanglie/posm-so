import React from 'react';
import Odoo from "../../../../../api/Odoo";
import {Link,withRouter} from 'react-router-dom';
import List from "@material-ui/core/List";
import Button from '@material-ui/core/Button';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Slide from '@material-ui/core/Slide';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Input from '@material-ui/core/Input';
import ArrowBack from '@material-ui/icons/ArrowBack';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import NumberFormat from 'react-number-format';

var odoo = new Odoo();
function Transition(props) {
  return <Slide direction="up" {...props} />;
}
class Checkout extends React.Component {
  constructor(props) {
    super(props); 

    this.state = {
      open: false,
      data: [],
      Transition: null,
      prod_num: false,
      click: false,
      so_id: false,
    };
  };
  handleClickOpen = (value) => {
    console.log('this.state.data',this.state.data)

    this.setState({open: true,so_id: value});
  };

  handleRequestClose = () => {
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
    let data = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    
    let btnCheckout = localStorage.getItem('cart') ? true : false;
    for (var i = 0; i < data.length; i++) {
        var qty = data[i].qty;
        var price = data[i].price_unit;
        var subtotal = qty * price;
        data[i].subtotal = subtotal;
    }
    let total = data.reduce((key, data) => key + data.subtotal, 0);
    this.setState({  
      user : JSON.parse(localStorage.getItem('user')),
      prod_num : this.randomNum(),
      data : data,
      count : data.length,
      total : total,
      btnCheckout : btnCheckout
    })
  }

  componentDidMount(){
    this.setState({
      click : false
    })
  }
  updateQty(item){
    let items = this.state.data;
    var newQty = item.qty.target.value;
    const findqty = items.find( itemqty => itemqty.id === item.id );
    findqty.qty= newQty;
    findqty.subtotal = findqty.price_unit * newQty;

    let total = items.reduce((key, items) => key + items.subtotal, 0);

    this.setState({ 
      total : total,
      data : items,
    })
    localStorage.setItem('cart', JSON.stringify(items));
    
  }
  increaseQty(item){
    // update local qty
    let products = [...this.state.data];
    const findprod = products.find( prodid => prodid.id === item.id );
    findprod.qty+= 1;
    findprod.subtotal = findprod.price_unit * findprod.qty;

    products.splice(item.index,1,findprod)

    let total = products.reduce((key, products) => key + products.subtotal, 0);

    this.setState({ 
      total : total,
      data : products,
    })
    localStorage.setItem('cart', JSON.stringify(products));
  }

  decreaseQty(item){
        // update local qty
        let products = [...this.state.data];
        const findprod = products.find( prodid => prodid.id === item.id );
        findprod.qty-= 1;
        findprod.subtotal = findprod.price_unit * findprod.qty;
        // findprod.qty-= 1;

        var itemqty = findprod.qty;
        if(itemqty == 0){
          products.splice(products.indexOf(findprod),1)
        }

        let total = products.reduce((key, products) => key + products.subtotal, 0);
    
        this.setState({ 
          total : total,
          data : products,
        })
        localStorage.setItem('cart', JSON.stringify(products));

        if (total == 0){
          this.props.history.push('/app/pos/categories');
        }
  }


  getTime(){
    // 2019-08-12 08:38:26
    var now = new Date();
    var dd = now.getDate();
    var mm = now.getMonth() + 1; 
    var s = now.getSeconds();
    var m = now.getMinutes();
    var h = now.getHours();
    var yyyy = now.getFullYear();

    if (dd < 10) {
      dd = '0' + dd;
    } 
    if (mm < 10) {
      mm = '0' + mm;
    } 
    if (s < 10) {
      s = '0' + s;
    }
    if (m < 10) {
      m = '0' + m;
    }
    if (h < 10) {
      h = '0' + h;
    }

    var date = yyyy + '-' + mm + '-' + dd + ' ' + h + ':' + m + ':' + s;
    return date;
  }
  checkOut(){
    var date = this.getTime();
    var id = this.state.prod_num; 
    let data = [...this.state.data];
    let items = [];
    for (var i = 0; i < data.length; i++) {
      items.push([
        0,0,
        {
          name: data[i].name,
          price_unit: data[i].price_unit,
          product_id: data[i].id,
          product_uom: 1,
          product_uom_qty: data[i].qty,
          sequence: 10,
          route_id: false,
          customer_lead: 0,
          discount: 0,
          layout_category_id: false,
          analytic_tag_ids : [[6, false, []]]
        }
      ])
    }
    console.log('checkout', items)
    // open receipt
    this.setState({
      order_name : "Order " + id,
      company    : "InGate",
    })


    var params = [[{
      "user_id": 1,
      "note": "",
      "warehouse_id": 1,
      "picking_policy": "direct",
      "team_id": 1,
      "company_id": 1,
      "date_order": date,
      "partner_id": this.state.user[0].user_id,
      "partner_invoice_id": this.state.user[0].user_id,
      "partner_shipping_id": this.state.user[0].user_id,
      "validity_date": false,
      "pricelist_id": 2,
      "payment_term_id": false,
      "order_line": items,
      "incoterm": false,
      "client_order_ref": false,
      "analytic_account_id": false,
      "fiscal_position_id": false,
      "origin": false
    }]]
    odoo.connect(function (err) {
      if (err) { return console.log(err); }
      odoo.execute_kw("sale.order", "create", params, function (err, value) {
          if (err) { return console.log(err); }else{
            // console.log(value)
            var confirm = [
              [
                value
              ]
            ]
            var so = value
            odoo.execute_kw("sale.order","action_confirm", confirm, function (err, data) {
              if (err) { return console.log(err); }else{
                console.log(so)
                localStorage.removeItem('cart');
                this.handleClickOpen(so);
              }            
            }.bind(this))

          }
      }.bind(this));
    }.bind(this));

  }
  sendData(){
    odoo.connect(function (err) {
      if (err) { return console.log(err); }
      var inParams = [];
      inParams.push();
      var params = [];
      params.push(inParams);
      console.log('exec',params)
      odoo.execute_kw("pos.order", "create_from_ui", params, function (err, value) {
          if (err) { return console.log(err); }
          console.log('data', value);

      });
  });

  }
  // end function
  render() {
    const {
      products,
      data,
    } = this.state;

    return (
      <div className="row animated slideInUpTiny animation-duration-3">
      <Typography variant="title" color="inherit" style={{
            }}><h1 className="page-title">Cart</h1></Typography>
      <List>
        {data.map((product, index) => (
            <ListItem >
              <div class="list-prod-img">
                <img src={ `data:image/png;base64,${product.image_small}` } alt={product.display_name}/>
              </div>
              <ListItemText className="br-break list-prod-desc" 
                  button key={product.product_name} onClick={event => this.handleToggle(event, product.id)}
                  >
                <h4>{product.product_name}</h4>
                {/* <h6>Nasi, ATL paha goreng, tahu, tempe, sambal, lalapan dan air mineral</h6> */}
                <h5>RP <NumberFormat value={product.price_unit} displayType={'text'} thousandSeparator={true} /></h5>
              </ListItemText>
              {!product.qty?
              <div className="more-btn">
              <Button className="list-prod-add" color="primary" onClick={
                event => 
                this.addItem({'id':product.id,'price':product.list_price,'qty':1,'product_name':product.display_name,'image_small':product.image_small,'index': index})
                }>Add + </Button>
              </div>
                : 
              <div className="more-btn">
              <Button className="list-prod-add" color="primary" onClick={
                event => 
                this.decreaseQty({'id':product.id,'price':product.list_price,'qty':1,'product_name':product.display_name,'image_small':product.image_small,'index': index})
                }>-</Button>
              <Typography>{product.qty}</Typography>
              <Button className="list-prod-add" color="primary" onClick={
                event => 
                this.increaseQty({'id':product.id,'price':product.list_price,'qty':1,'product_name':product.display_name,'image_small':product.image_small,'index': index})
                }>+</Button>
              </div>
              }
            </ListItem>
        ))}
      </List>
      
      <Card className='card-fullwidth mb-3 mt-3'>
      <CardContent >
        <List>
          <ListItem>
            <ListItemText  color="textSecondary" >
              Total : 
            </ListItemText>
            <ListItemText  color="textSecondary" className="receipt-right">
              RP <NumberFormat value={this.state.total} displayType={'text'} thousandSeparator={true} />
            </ListItemText>
          </ListItem>
          <ListItem >
            <ListItemText  color="textSecondary">
              Payment : 
            </ListItemText>
            <ListItemText  color="textSecondary" className="receipt-right">
              Cash On Delivery
            </ListItemText>
          </ListItem>
        </List>
      </CardContent>
      <CardActions>
        <Button 
        disabled={!this.state.btnCheckout}
        onClick={() => this.checkOut()} fullWidth color="primary" variant="contained" 
        >
            Checkout
        </Button>
      </CardActions>
    </Card>
    
    
    {/* receipt */}
    <Dialog
        fullScreen
        open={this.state.open}
        onClose={this.handleRequestClose}
        TransitionComponent={Transition}
      >
        <AppBar className="position-relative">
          <Toolbar>
            <Link className="jr-list-link" to={{pathname:"/app/pos/categories"}} >
              <ArrowBack className="white-icon"/>
            </Link>

            <Typography variant="title" color="inherit" style={{
              flex: 1,
            }}>
              <h4 className="receipt-title">Order {this.state.so_id} </h4>
              
            </Typography>
          </Toolbar>
        </AppBar>
        
        {this.state.user.map((users, index) => (
          <List>
              <ListItem >
                <ListItemText className="br-break list-prod-desc receipt-cust" 
                    primary={`Name   : ${users.name}`}
                    />
              </ListItem>

              <ListItem >
                <ListItemText className="br-break list-prod-desc receipt-cust"
                    primary={`Phone  : ${users.phone}`}
                />
              </ListItem>
              <ListItem >
                <ListItemText className="br-break list-prod-desc receipt-cust"
                    primary={`Email  : ${users.email}`}
                />
              </ListItem>
              <ListItem >
                <ListItemText className="br-break list-prod-desc receipt-cust"
                    primary={`Alamat  : ${users.street}`}
                />
              </ListItem>

            </List>
        ))}
        
        <List>
          {this.state.data.map((product, index) => (
              <ListItem >
                <div class="list-prod-img">
                  <img src={ `data:image/png;base64,${product.image_small}` } alt={product.name}/>
                </div>
                <ListItemText className="br-break list-prod-desc" 
                    primary={`${product.qty}x ${product.name}`}
                    />
                <ListItemText className="right-receipt"
                >
                  RP <NumberFormat value={product.subtotal} displayType={'text'} thousandSeparator={true} />
                </ListItemText>
              </ListItem>
          ))}
        </List>
        <List>
          <ListItem>
            <ListItemText  color="textSecondary" >
              Total : 
            </ListItemText>
            <ListItemText  color="textSecondary" className="receipt-right">
              RP <NumberFormat value={this.state.total} displayType={'text'} thousandSeparator={true} />
            </ListItemText>
          </ListItem>
          <ListItem >
            <ListItemText  color="textSecondary">
              E-Wallet : 
            </ListItemText>
            <ListItemText  color="textSecondary" className="receipt-right">
              RP <NumberFormat value={this.state.total} displayType={'text'} thousandSeparator={true} />
            </ListItemText>
          </ListItem>
          {/* <ListItem >
            <ListItemText  color="textSecondary">
              Change :
            </ListItemText>
            <ListItemText  color="textSecondary" className="receipt-right">
              0
            </ListItemText>
          </ListItem> */}
        </List>
      </Dialog>
    </div>  
    );
  }
}

export default Checkout;
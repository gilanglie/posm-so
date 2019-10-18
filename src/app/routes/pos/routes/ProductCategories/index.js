import React from 'react';
// import ContainerHeader from 'components/ContainerHeader/index';
import Odoo from "../../../../../api/Odoo";
import ProductGridItem from 'components/pos/Categories';


import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import {Link} from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import TextField from '@material-ui/core/TextField';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CartIcon from '@material-ui/icons/ShoppingCart';
import NumberFormat from 'react-number-format';



var odoo = new Odoo();
function Transition(props) {
  return <Slide direction="up" {...props} />;
}
class Categories extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      categsData : [],
      open: false,
      name: '',
      phone: '',
      email: '',
      street: '',
      setOpen: false
    };
  };
  handleClickOpen = () => {
    this.setState({open: true});
  };

  handleRequestClose = () => {
    this.setState({open: false});
  };

  componentWillMount () {
    localStorage.getItem('user') ? 
      console.log(localStorage.getItem('user'))
     : 
     this.handleClickOpen(); 
     ;
    
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
     if (count == 0){
       setOpen = false;
     }
    this.setState({ 
      setOpen : setOpen,
      data : data,
      total : total,
      count : count,
    })

      this.getCategory()
  }
  
  login(){
    var name = this.state.name;
    var phone = this.state.phone;
    var email = this.state.email;
    var street = this.state.street;
    
    if(name == '' && phone == '' && email == '' || name != '' && phone == '' && email == '' || 
       name == '' && phone != '' && email == ''|| name != '' && phone != '' && email == '' ){
      console.log('err')
    }else{
      odoo.connect(function (err) {
          if (err) { return console.log(err); }
          var inParams = [];
          inParams.push(
            {
              name: name,
              phone: phone,
              email: email,
              street: street
            }
          ); //fields
          
            // check by phone exist
            var inParams = [];
            inParams.push([["phone", "=", phone]]);
            inParams.push(["phone", "name", "email","street"]); //fields
            var params = [];
            params.push(inParams);
            odoo.execute_kw("res.partner", 'search_read', params, function (err, value) {
                if (err) { return console.log(err); }
                console.log('login',value)
                // no exist
                if(value.length == 0) {
                  var inParams = [];
                  inParams.push(
                    {
                      name: name,
                      phone: phone,
                      email: email,
                      street: street
                    }
                  ); //fields
                  var params = [];
                  params.push(inParams);
                  odoo.execute_kw("res.partner", 'create_from_ui', params, function (err, user_id) {
                      if (err) { return console.log(err); }
                      let user = [{name, phone ,email,street,user_id}];
                      localStorage.setItem('user',JSON.stringify(user))
                      this.handleRequestClose();
                  }.bind(this))
                }else{
                // exist
                  let user = [{name, phone ,email,street,'user_id': value[0].id}];
                  localStorage.setItem('user',JSON.stringify(user))
                  this.handleRequestClose();
                }


            }.bind(this));

          ;
      }.bind(this));
    }
    
  }
  getCategory(){
    odoo.connect(function (err) {
        if (err) { return console.log(err); }
        var inParams = [];
        inParams.push([]);
        inParams.push(["id", "name", "parent_id", "child_id","image"]); //fields
        var params = [];
        params.push(inParams);
        odoo.execute_kw("product.category", 'search_read', params, function (err, value) {
            if (err) { return console.log(err); }
            this.setState({
              categsData : value
            })
            // console.log('categories',value)
        }.bind(this));
    }.bind(this));
  }
  getProduct(){ 
    odoo.connect(function (err) {
        if (err) { return console.log(err); }
        // console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([["sale_ok", "=", true], ["available_in_pos", "=", true]]);
        inParams.push(["display_name", "list_price" 
                      , "categ_id",  
                      "description_sale", "description", "product_tmpl_id"]); //fields
        var params = [];
        params.push(inParams);
        odoo.execute_kw("product.product", 'search_read', params, function (err, value) {
            if (err) { return console.log(err); }
            console.log('Result: ', value);
            this.setState({
              products : value,
              recommend : value[0],
            })
        }.bind(this));
    }.bind(this));
  }
  render() {
    return (
      <div className="row animated slideInUpTiny animation-duration-3 prod-list">
        <Link to={{pathname:"/app/pos/cart"}}>
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            className="snackbar"
            open={this.state.setOpen}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{this.state.count} items | 
            RP <NumberFormat value={this.state.total} displayType={'text'} thousandSeparator={true} />
            </span>}
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


      {this.state.categsData.map((product, index) => (
        <ProductGridItem key={index} product={product}/>
      ))}
      {/* receipt */}
    <Dialog
        fullScreen
        open={this.state.open}
        onClose={this.handleRequestClose}
        TransitionComponent={Transition}
      >
        <AppBar className="position-relative">
          <Toolbar>
            <Typography variant="title" color="inherit" style={{
              flex: 1,
            }}>
              <h4 className="receipt-title">Login</h4>
            </Typography>
          </Toolbar>
        </AppBar>
        <ValidatorForm
                ref="form"
                className="form-login"
                onError={errors => console.log(errors)}
            >
          <TextField
            required
            fullWidth	
            id="standard-required"
            label="Name"
            value={this.state.name}
            name="name"
            className="login-input mb-3"
            margin="normal"
            validators={['required']}
            onChange={
              // e => this.setState({name : e.target.value})
              e => this.setState({name : e.target.value})
            } 
          />
          <TextField
            fullWidth	
            required
            id="standard-required"
            label="Phone"
            name="phone"
            defaultValue=""
            type="number"
            className="login-input mb-3"
            margin="normal"
            validators={['required']}
            value={this.state.phone}
            onChange={
              e => this.setState({phone : e.target.value})
            } 
          />
          <TextField
            fullWidth	
            required
            id="standard-required"
            label="Email"
            name="email"
            defaultValue=""
            type="email"
            className="login-input mb-3"
            margin="normal"
            validators={['required']}
            value={this.state.email}
            onChange={
              e => this.setState({email : e.target.value})
            } 
          />
          <TextField
            fullWidth	
            required
            id="standard-required"
            label="Alamat"
            name="street"
            defaultValue=""
            type="text"
            className="login-input mb-3"
            margin="normal"
            validators={['required']}
            value={this.state.street}
            onChange={
              e => this.setState({street : e.target.value})
            } 
          />
          
            <Button 
                onClick={() => this.login()} type="submit" fullWidth color="primary" className="login-btn" variant="contained"
            >
                ORDER NOW
        </Button>
        </ValidatorForm>
      </Dialog>
    </div>  
    );
  }
}

export default Categories;
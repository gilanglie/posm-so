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
class OrderHistory extends React.Component {
  constructor(props) {
    super(props); 

    this.state = {
      open: false,
      historyData: [],
      Transition: null,
      click: false,
      orderLine: [],
      payment: [],
      orderDetail: []
    };
  };
  handleClickOpen = (data) => {
    // console.log('data',data)

    // get order line
    odoo.connect(function (err) {
      if (err) { return console.log(err); }
      var inParams = [];
      inParams.push(data.lines);
      inParams.push([
        "product_id",
        "qty",
        "price_unit",
        "discount",
        "tax_ids_after_fiscal_position",
        "tax_ids",
        "price_subtotal",
        "price_subtotal_incl",
      ]);
      var params = [];
      params.push(inParams);
      odoo.execute_kw("sale.order", 'read', params, function (err, lines) {
        if (err) { return console.log(err); }
        // get payment
        var inParams = [];
        inParams.push(data.statement_ids);
        inParams.push([
          "journal_id",
          "statement_id",
          "mercury_prefixed_card_number",
          "mercury_card_brand",
          "mercury_card_owner_name",
          "amount"
        ]);
        var params = [];
        params.push(inParams);
        odoo.execute_kw("account.bank.statement.line", 'read', params, function (err, payment) {
          if (err) { return console.log(err); }
          // get payment
          console.log(payment)
          this.setState({
            orderLine : lines,
            open: true,
            payment : payment,
            orderDetail : data
          })
        }.bind(this));
      }.bind(this));
    }.bind(this));
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

  componentWillMount () {
    let user = JSON.parse(localStorage.getItem('user'));
    this.setState({  
      user : user,
    })
    this.getHistory(user)
  }
  getHistory(user){
    console.log(user[0].name)
    odoo.connect(function (err) {
        if (err) { return console.log(err); }
        
        var inParams = [];
        inParams.push([[
          "partner_id",
          "ilike",
          user[0].user_id
        ]]);
        inParams.push([
          "name",
          "pos_reference",
          "partner_id",
          "date_order",
          "user_id",
          "amount_total",
          "company_id",
          "state",
          "session_id",
          "lines",
          "statement_ids"
        ]);
        var params = [];
        params.push(inParams);
        odoo.execute_kw("sale.order", 'search_read', params, function (err, value) {
            if (err) { return console.log(err); }
            this.setState({
              historyData : value
            })
        }.bind(this));
    }.bind(this));
  }
  
  // end function
  render() {
    const {
      historyData,
      open,
      orderDetail,
      orderLine,
      payment,
      user
    } = this.state;

    return (
      <div className="row animated slideInUpTiny animation-duration-3">
      <Typography variant="title" color="inherit">
        <h1 className="page-title">Order History</h1>
      </Typography>
      {historyData.map((data, index) => (
            <ListItem >
              <ListItemText className="br-break list-prod-desc" 
                  button key={index} onClick={event => this.handleClickOpen(data)}
                  > 
                <h4>{data.pos_reference}</h4>
                <h5>{data.date_order}</h5>
              </ListItemText>
            </ListItem>
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
            <ArrowBack className="white-icon" onClick={() => this.handleRequestClose()}/>
            <Typography variant="title" color="inherit" style={{
              flex: 1,
            }}>
              <h4 className="receipt-title">{orderDetail.pos_reference} </h4>
              
            </Typography>
          </Toolbar>
        </AppBar>
        
        {user.map((users, index) => (
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
            </List>
        ))}

        <List>
          {orderLine.map((product, index) => (
              <ListItem >
                <ListItemText className="br-break list-prod-desc" 
                    primary={`${product.qty}x ${product.product_id[1]}`}
                    />
                <ListItemText className="right-receipt"
                >
                  RP <NumberFormat value={product.price_subtotal} displayType={'text'} thousandSeparator={true} />
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
              RP <NumberFormat value={orderDetail.amount_total} displayType={'text'} thousandSeparator={true} />
            </ListItemText>
          </ListItem>
          {payment.map((pay, index) => (
          <ListItem >
            <ListItemText  color="textSecondary">
              {pay.journal_id[1]} : 
            </ListItemText>
            <ListItemText  color="textSecondary" className="receipt-right">
              RP <NumberFormat value={pay.amount} displayType={'text'} thousandSeparator={true} />
            </ListItemText>
          </ListItem>
          ))}
          <ListItem >
            <ListItemText  color="textSecondary">
              Change :
            </ListItemText>
            <ListItemText  color="textSecondary" className="receipt-right">
              0
            </ListItemText>
          </ListItem>

        </List>
      </Dialog>
    </div>  
    );
  }
}

export default OrderHistory;
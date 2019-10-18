import React from 'react';
import Button from '@material-ui/core/Button';

import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";


const ProductGridItem = ({product}) => {
  const {id,display_name, price,rating, description,thumb,mrp,variant,offer,name} = product;
  
  return (
    <ListItem button key={display_name} onClick={event => this.handleToggle(event, id)}>
    <div class="list-prod-img">
      <img src="https://pos.ingate.id/web/image?model=product.product&field=image_small&id=4"/>
    </div>
    <ListItemText className="br-break list-prod-desc" primary={display_name} secondary=""/>
    <Button className="list-prod-add" color="primary" onClick={event => this.click(event)}>Add + </Button>
  </ListItem>

  )
};

export default ProductGridItem;


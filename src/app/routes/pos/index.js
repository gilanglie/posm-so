import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import asyncComponent from '../../../util/asyncComponent';

const pos = ({match}) => (
  <div className="app-wrapper">
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/categories`}/>
      <Route path={`${match.url}/categories`}
             component={asyncComponent(() => import('./routes/ProductCategories'))}/>
      <Route path={`${match.url}/products`} component={asyncComponent(() => import('./routes/Products'))}/>
      <Route path={`${match.url}/cart`} component={asyncComponent(() => import('./routes/Checkout'))}/>
      <Route path={`${match.url}/history`} component={asyncComponent(() => import('./routes/OrderHistory'))}/>
      <Route component={asyncComponent(() => import('components/Error404'))}/>
    </Switch>
  </div>
); 

export default pos;

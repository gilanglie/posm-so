import React from 'react';
import {ConnectedRouter} from 'connected-react-router'
import {Provider} from 'react-redux';
import {Route, Switch} from 'react-router-dom';
import configureStore, {history} from './store';

import './firebase/firebase';
import App from './containers/App';

import Store from './components/mobx/store';
import {decorate, observable, action, computed} from 'mobx';
export const store = configureStore();

decorate(Store, {
  cartItems: observable,
  addCart: action,
  delCart: action,
  updateCart: action,
  cartCount: computed,
  cartList: computed
})
const MainApp = () =>
<Provider store={store}>
<ConnectedRouter history={history}>
  <Switch>
    <Route path="/" component={App}/>
  </Switch>
</ConnectedRouter>
</Provider>;


export default MainApp;
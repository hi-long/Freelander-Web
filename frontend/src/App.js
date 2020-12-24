import React, { Component } from 'react';
import './App.css';
import Introduction from './containers/Introduction/Introduction';
import { Redirect, Route, Switch, withRouter } from 'react-router';
import Homepage from './containers/Homepage/Homepage';
import ServicesBrowse from './containers/ServicesBrowse/ServicesBrowse';
import ServiceBuilder from './containers/ServiceBuilder/ServiceBuilder';
import Profile from './containers/Profile/Profile';
import ServicesSaved from './containers/ServicesSaved/ServicesSaved';
import Messenger from './containers/Messenger/Messenger';
import { connect } from 'react-redux';
import * as actions from './containers/store/actions/index';
import NotFound from './containers/NotFound/NotFound';
import ServiceManagement from './containers/ServicesManagement/ServiceManagement';

class App extends Component {
  componentDidMount() {
    this.props.onTryAutoSignUp();
  }

  render() {
    return (
      <Switch>
        <Route path='/browse' component={ServicesBrowse}></Route>
        <Route path='/not-found' component={NotFound}></Route>
        {this.props.userId && <Route path='/:id/service-builder' component={ServiceBuilder}></Route>}
        {this.props.userId && <Route path='/:id/services' component={ServiceManagement}></Route>}
        {this.props.userId && <Route path='/:id/saved-list' component={ServicesSaved}></Route>}
        {this.props.userId && <Route path='/:id/messenger' component={Messenger}></Route>}
        <Route path='/:id' component={Profile}></Route>
        <Route path='/:id/services/:service_id' component={Profile}></Route>
        <Route path='/' component={this.props.userId ? Homepage : Introduction}></Route>
        <Redirect to='/'></Redirect>
      </Switch>
    )
  }
}

{/* <Route path='/browse' render={() => <ServicesBrowse socket={socket}></ServicesBrowse>}></Route>
        <Route path='/not-found' render={() => <NotFound socket={socket}></NotFound>}></Route>
        <Route path='/:id/services' render={() => <ServiceBuilder socket={socket}></ServiceBuilder>}></Route>
        <Route path='/:id/saved-list' render={() => <ServicesSaved socket={socket}></ServicesSaved>}></Route>
        <Route path='/:id/messenger' render={() => <Messenger socket={socket}></Messenger>}></Route>
        <Route path='/:id' render={() => <Profile socket={socket}></Profile>}></Route>
        <Route path='/' component={this.props.isAuth ? Homepage : Introduction}></Route> */}

const mapStateToProps = state => {
  return {
    userId: state.authReducer.userId,
    userCover: state.authReducer.cover,
    username: state.authReducer.name,
    userRole: state.authReducer.userRole,
    searchKeywords: state.searchKeywords
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTryAutoSignUp: () => dispatch(actions.authCheckState())
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));

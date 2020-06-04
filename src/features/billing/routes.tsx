// External
import * as React from 'react';
import loadable from '@loadable/component';
import { Switch, RouteComponentProps, Route } from 'react-router-dom';

const Subscription = loadable(() => import(/* webpackChunkName: "subscription" */'./subscription/components/Subscription'));
const Upgrade = loadable(() => import(/* webpackChunkName: "upgrade" */'./upgrade/components/Upgrade'));

const Routes = ({ match }: RouteComponentProps<{}>) => (
  <Switch>
    <Route exact path={`${match.path}/subscription`} component={Subscription} />
    <Route exact path={`${match.path}/subscription/:slug`} component={Subscription} />
    <Route exact path={`${match.path}/upgrade`} component={Upgrade} />
    <Route exact path={`${match.path}/upgrade/:slug`} component={Upgrade} />
  </Switch>
);

export default Routes;

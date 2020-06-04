// External
import React from 'react';
import loadable from '@loadable/component';
import { Switch, RouteComponentProps, Route } from 'react-router-dom';

const Stock = loadable(() => import(/* webpackChunkName: "stock" */'./stock/components/Stock'));
const History = loadable(() => import(/* webpackChunkName: "history" */'./stock/components/History'));


const Routes = ({ match }: RouteComponentProps<{}>) => (
  <Switch>
    <Route exact path={`${match.path}/stock`} component={Stock} />
    <Route exact path={`${match.path}/stock/history`} component={History} />
  </Switch>
);

export default Routes;

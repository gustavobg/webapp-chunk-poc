import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import BillingRoutes from './features/billing/routes';
import ManagementRoutes from './features/management/routes';

export default function() {
    return (
      <Switch>
        <Route path="/billing" component={BillingRoutes} />
        <Route path="/management" component={ManagementRoutes} />
      </Switch>
    );
}

import { put, select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';


import iclinic from 'services/iclinic';
import { emitErrors } from 'shared/utils/emitErrors';
import { normalizeProducts } from './utils';

import { workerCheckout } from './sagas';
import {
  fetchCheckout,
  fetchCheckoutSuccess,
  fetchCheckoutFailure,
  selectProductSuccess,
} from './actions';
import {
  selectCheckout,
  selectContract,
  selectUserProducts,
} from './selectors';

describe('state/billing/subscription/sagas', () => {
  it('just works!', async () => {
    const slug = 'plus';
    const name = 'Plus';
    const seletedProducts = ['pro', 'marketing'];
    const seletedProductsNames = ['Pro', 'Marketing'];
    const fetchProducts = normalizeProducts('slug', slug, seletedProducts);
    const fetchProductsName = normalizeProducts('name', name, seletedProductsNames);
    put(selectProductSuccess(fetchProducts, fetchProductsName));
  });

  describe('workerCheckout', () => {
    const checkout = {
      isAnnual: false,
      cpfCnpj: '4622732852',
      products: {
        plus: [1, 2, 3],
        marketing: [1, 2, 3],
        video: [3],
      },
      card: {
        number: '1660',
        owner: 'Tyrese Campbell',
        flag: 'visa',
        expirationMonth: '02',
        expirationYear: '2021',
        cvv: '510',
      },
    };

    const selectorState = {
      card: {
        number: '1660',
        owner: 'Tyrese Campbell',
        flag: 'visa',
        expirationDate: '02/20',
        cvv: '510',
      },
      isMonthly: false,
      products: {
        plus: [1, 2, 3],
        marketing: [1, 2, 3],
        video: [3],
      },
    };

    it('make checkout user', async () => {
      await expectSaga(workerCheckout)
        .provide([
          [select(selectCheckout), selectorState.card],
          [select(selectContract), selectorState.isMonthly],
          [select(selectUserProducts), selectorState.products],
          [matchers.call.fn(iclinic.subscription.fetchSubscribe, checkout), {}],
        ])
        .put(fetchCheckoutSuccess())
        .dispatch(fetchCheckout())
        .run();
    });

    it('handles catch errors', async () => {
      const errors = [
        {
          message: 'malformed request',
          errorCode: '400001',
        },
      ];

      await expectSaga(workerCheckout)
        .provide([
          [select(selectCheckout), selectorState.card],
          [select(selectContract), selectorState.isMonthly],
          [select(selectUserProducts), selectorState.products],
          [matchers.call.fn(iclinic.subscription.fetchSubscribe, checkout), { errors }],
        ])
        .put(fetchCheckoutFailure(emitErrors(errors)))
        .dispatch(fetchCheckout())
        .run();
    });
  });
});

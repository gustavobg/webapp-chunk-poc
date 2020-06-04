// Extenal
import { createSelector } from 'reselect';

// Internal
import {
  isSecurityCodeValid,
  isCardNumberValid,
  isExpirationDateValid,
} from 'shared/utils/creditCardValidation';
import { isValidDocument } from 'shared/utils/validation';


import { StoreState } from 'state/rootReducer';
import { formatToInteger } from 'shared/utils/strings';
import { PRODUCT_SUBSCRIPTION } from 'state/subscription/constants';
import { getAddonDetail, normalizeCheck, getStaticProductFunctionalitiesBySlug } from './utils';
import { Product, ListPhysicians } from './types';

const stateProducts = (state: StoreState) => state;

export const getSelectedProducts = (state: StoreState, props: PRODUCT_SUBSCRIPTION) => (
  state.billing && state.billing.subscription.products[props]
);
export const getSelectedAddons = (state: StoreState) => state.billing.subscription
  && state.billing.subscription.selectedAddons;
export const getCurrentAddon = (state: StoreState) => state.billing.subscription
  && state.billing.subscription.currentAddon;
export const selectCheckout = (state: StoreState) => state.billing.subscription.checkout;
export const selectUserProducts = (
  state: StoreState,
) => state.billing.subscription.selectedUsersWithProduct;
export const selectContract = (state: StoreState) => state.billing.subscription.isMonthly;

export const getFormattedProductsNames = (state: StoreState) => {
  const { productName, product } = state.billing.subscription;
  const plans = ['Pro', 'Plus', 'Starter'];
  const name = (productName && product) ? productName.map(element => (plans.includes(element) ? `Plano ${element}` : element)).join(' + ') : null;
  return name;
};

export const getSelectPhysicians = (state: StoreState) => state.billing.subscription.physicians;

export const getCheckoutValidation = createSelector(
  [selectCheckout],
  checkout => {
    const validate = checkout.cpfCnpj && isValidDocument(checkout.cpfCnpj)
    && checkout.cvv && isSecurityCodeValid(checkout.cvv, checkout.number)
    && checkout.expirationDate && isExpirationDateValid(checkout.expirationDate)
    && checkout.number && isCardNumberValid(checkout.number)
    && checkout.owner;
    return !!validate;
  },
);

export const getProductsNames = createSelector(
  [stateProducts],
  products => getFormattedProductsNames(products),
);

const getPeriod = (period: boolean) => (period ? 'monthly' : 'annual');
const formatSuffix = (period: boolean) => (period ? '/mês' : '/anual');

export const formatPeriod = (period: string, frequencie: number) => {
  const label = (period === 'monthly' ? 'mês' : 'ano');
  if (period === 'monthly' && frequencie > 1) {
    return 'meses';
  }
  if (period === 'annual' && frequencie > 1) {
    return 'anos';
  }
  return label;
};

export const displayBackButton = createSelector(
  [getSelectedAddons, getCurrentAddon],
  (addons, currentAddon) => addons.indexOf(currentAddon) !== 0,
);

export const getProductDefinition = (isMonthly: boolean) => createSelector(
  [(product: Product) => product],
  product => {
    const period = getPeriod(isMonthly);
    const suffix = formatSuffix(isMonthly);
    return {
      suffixValue: suffix,
      name: product.name && product.name,
      productValue: formatToInteger(product.values[period]),
      productDiscount: product.promotion
      && product.promotion.frequencies[period]
      && formatToInteger(product.promotion.frequencies[period].value),
      frequencyNumber: product.promotion
      && product.promotion.frequencies[period]
      && product.promotion.frequencies[period].frequencyNumber,
      functionalities: product.slug && getStaticProductFunctionalitiesBySlug(product.slug),
      percentage: product.promotion
      && product.promotion.frequencies[period]
      && formatToInteger(product.promotion.frequencies[period].percentage),
      expiration: product.promotion
      && product.promotion.frequencies[period]
      && formatPeriod(period, product.promotion.frequencies[period].frequencyNumber),
    };
  },
);

export const getProductDetail = (
  isMonthly: boolean,
  currentAddon: string,
  physicians: [],
) => createSelector(
  [(product: Product) => product],
  product => {
    const addon = getAddonDetail(product, currentAddon);
    const physiciansSize = (normalizeCheck(physicians, 'profile_id').length);
    const {
      name,
      productValue,
      productDiscount,
    } = getProductDefinition(isMonthly)(addon);
    return {
      name,
      productValue,
      productDiscount,
      productDiscountTotal: productDiscount && productDiscount * physiciansSize,
      productValueTotal: productValue && productValue * physiciansSize,
    };
  },
);

export const getPhysician = createSelector(
  [(physician: ListPhysicians) => physician],
  physician => ([
    {
      name: 'Selecionar todos usuários',
      physician_id: 0,
      profile_id: 0,
    },
    ...physician,
  ]),
);

export const getPhysicianPayload = createSelector(
  [getSelectPhysicians],
  physicians => physicians.filter(physician => physician.profile_id !== 0),
);

// External
import {
  put,
  call,
  takeLatest,
  all,
  select,
} from 'redux-saga/effects';

// Internal
import iclinic from 'services/iclinic';
import { StoreState } from 'state/rootReducer';
import { emitErrors } from 'shared/utils/emitErrors';
import { captureException } from 'shared/utils/handlerErrors';
import { STEPS, CHECKOUT } from 'shared/constants/Billing';
import { ProductSelected } from './types';
import * as actions from './actions';
import * as types from './constants';
import {
  checkPhysicians,
  checkPhysiciansAll,
  normalizeProducts,
  findAddonInProducts,
  verifyNextStep,
  clearCheckPhysicians,
  normalizeCheckout,
  createPayloadSingleUser,
} from './utils';

import {
  selectCheckout,
  selectContract,
  selectUserProducts,
  getPhysician,
  getPhysicianPayload,
} from './selectors';

const getProduct = (state: StoreState) => state.billing.subscription.product;
const selectUserInfo = (state: any) => state.userInfo.userData;
const getSharedInfo = (state: any) => state.shared;
const selectPhysicians = (state: StoreState) => state.billing.subscription.physicians;
const selectProducts = (state: StoreState) => state.billing.subscription.products;
const selectProductsSelected = (state: StoreState) => state.billing.subscription.product;
const selectAddonsSelected = (state: StoreState) => state.billing.subscription.selectedAddons;
const selectCurrentAddon = (state: StoreState) => state.billing.subscription.currentAddon;
const getProductName = (state: StoreState) => state.billing.subscription.productName;
const selectBasePlanSelected = (state: StoreState) => state.billing.subscription.selectedBasePlan;
const selectExtraSelected = (state: StoreState) => state.billing.subscription.selectedExtra;
const selectAddonsWithUsers = (
  state: StoreState,
) => state.billing.subscription.selectedUsersWithProduct;
const selectFrequency = (state: StoreState) => state.billing.subscription.isMonthly;
const selectStep = (state: StoreState) => state.billing.subscription.step;
const selectSuccessUrl = (state: StoreState) => state.subscription.successUrl;
const selectProgressStep = (state: StoreState) => state.billing.subscription.progressStep;

export function* wokerSubscriptionProducts() {
  try {
    const { getResponseData, errors } = yield call(
      iclinic.subscription.fetchSubscriptionProduct,
    );

    if (errors) throw errors;
    const products = getResponseData();
    yield put(actions.fetchSubscriptionSuccess(products));
  } catch (error) {
    captureException(error);
  }
}

export function* separateSeletedProducts() {
  const { addons, base, extra } = yield select(selectProducts);
  const selectedProducts = yield select(selectProductsSelected);

  const selectedAddons = findAddonInProducts(addons, selectedProducts);
  const selectedBasePlan = findAddonInProducts(base, selectedProducts);
  const selectedExtra = findAddonInProducts(extra, selectedProducts);

  yield put(actions.setSelectedAddons(selectedAddons, selectedBasePlan, selectedExtra));
}

export function* workerGetListPhysicians() {
  const { activeClinicId } = yield select(selectUserInfo);
  try {
    const { getResponseData, errors } = yield call(
      iclinic.billing.getPhysicians,
      activeClinicId,
    );
    if (errors) throw errors;
    const physiciansData = getResponseData();

    const physicians = physiciansData.length > 1 ? getPhysician(physiciansData) : physiciansData;

    yield put(actions.listPhysiciansSuccess(physicians));
  } catch (error) {
    captureException(error);
  }
}

export function* workerOpenModal() {
  try {
    yield workerGetListPhysicians();
    yield separateSeletedProducts();

    const physiciansData = yield select(getPhysicianPayload);
    const addonsSelected = yield select(selectAddonsSelected);
    const basePlanSelected = yield select(selectBasePlanSelected);
    const extraSelected = yield select(selectExtraSelected);

    yield put(actions.createStepsFlow(physiciansData.length > 1 ? addonsSelected : []));

    if (verifyNextStep(addonsSelected, physiciansData)) {
      yield put(actions.setStep(STEPS.summary.value));
    } else {
      yield put(actions.setCurrentAddon(addonsSelected[0]));
      yield put(actions.setStep(STEPS.selectUsers.value));
    }

    yield put(actions.unionProductToUser(physiciansData, basePlanSelected[0], true));
    if (extraSelected.length > 0) {
      yield put(actions.unionProductToUser(physiciansData, extraSelected[0], true));
    }
    yield put(actions.openModalSuccess());
  } catch (error) {
    captureException(error);
  }
}

export function* selectProductSagas(
  action: {
    payload: {product: ProductSelected, productName: ProductSelected}
  },
) {
  try {
    const { product: slug, productName: name } = action.payload;
    const selectedProducts = yield select(getProduct);
    const selectedProductsNames = yield select(getProductName);

    const fetchProducts = normalizeProducts('', slug, selectedProducts);
    const fetchProductsNames = normalizeProducts('name', name, selectedProductsNames);

    yield put(actions.selectProductSuccess(fetchProducts, fetchProductsNames));
  } catch (error) {
    captureException(error);
    yield put(actions.selectProductFailure(emitErrors(error)));
  }
}

export function* workerSelectPhysicianSagas(action) {
  try {
    const { physicianId } = action.payload;
    const physiciansSelect = yield select(selectPhysicians);
    const currentAddon = yield select(selectCurrentAddon);

    const physicians = physicianId !== 0
      ? checkPhysicians(physicianId, physiciansSelect)
      : checkPhysiciansAll(physiciansSelect);

    yield put(actions.selectPhysicianSuccess(physicians, currentAddon));
    yield put(actions.unionProductToUser(physicians, currentAddon, false));
  } catch (error) {
    captureException(error);
    yield put(actions.selectPhysicianFailure(emitErrors(error)));
  }
}

export function* workerVerificationProductsWithUsersNext() {
  const addonsSelected = yield select(selectAddonsSelected);
  const currentAddon = yield select(selectCurrentAddon);
  const physiciansSelect = yield select(selectPhysicians);

  const index = addonsSelected.findIndex(addon => addon === currentAddon);

  if (addonsSelected.length - 1 > index) {
    yield put(actions.setCurrentAddon(addonsSelected[index + 1]));
    yield put(actions.listPhysiciansSuccess(clearCheckPhysicians(physiciansSelect)));
    yield put(actions.setStep(STEPS.selectUsers.value, 'next'));
  } else {
    yield put(actions.setStep(STEPS.summary.value, 'next'));
  }
}

export function* workerVerificationProductsWithUsersBack() {
  const addonsSelected = yield select(selectAddonsSelected);
  const currentAddon = yield select(selectCurrentAddon);
  const progressStep = yield select(selectProgressStep);
  const physiciansSelect = yield select(selectPhysicians);
  const index = addonsSelected.findIndex(addon => addon === currentAddon);

  if (addonsSelected.length - 1 >= index) {
    yield put(actions.setCurrentAddon(addonsSelected[index - 1]));
    yield put(actions.controlStepsFlow(progressStep - 1));
    yield put(actions.listPhysiciansSuccess(clearCheckPhysicians(physiciansSelect)));
  } else {
    yield put(actions.setStep(STEPS.summary.value, 'prev'));
  }
}

export function* workerGetSummary() {
  try {
    const physiciansSelect = yield select(getPhysicianPayload);
    const selectedProducts = yield select(selectProductsSelected);
    const addonsWithUsers = yield select(selectAddonsWithUsers);
    const { subscriptionId } = yield select(selectUserInfo);
    const frequency = yield select(selectFrequency);

    const hasMoreOnePhysicianSelected = physiciansSelect.length === 1;
    const payload = hasMoreOnePhysicianSelected ? Object.assign({
      products: createPayloadSingleUser(selectedProducts, physiciansSelect),
      frequency: frequency ? 'monthly' : 'annual',
    }) : Object.assign({
      products: addonsWithUsers,
      frequency: frequency ? 'monthly' : 'annual',
    });

    if (hasMoreOnePhysicianSelected) {
      yield put(actions.unionProductToSingleUser(payload.products));
    }

    const { getResponseData, errors } = yield call(
      iclinic.billing.calculateSummary,
      subscriptionId,
      payload,
    );

    if (errors) throw errors;
    const calculateSummary = getResponseData();
    yield put(actions.getSummarySuccess(calculateSummary));
  } catch (error) {
    captureException(error);
  }
}

export function* workerCheckout() {
  try {
    const [checkout, products, contract] = yield all([
      select(selectCheckout),
      select(selectUserProducts),
      select(selectContract),
    ]);

    const normalizedCheckoutPayload = normalizeCheckout(
      checkout, contract, products,
    );

    const { errors } = yield call(
      iclinic.subscription.fetchSubscribe,
      normalizedCheckoutPayload,
    );

    if (errors) throw errors;
    yield put(actions.fetchCheckoutSuccess());
    window.localStorage.setItem(CHECKOUT, 'checkout');
  } catch (error) {
    yield put(actions.fetchCheckoutFailure(emitErrors(error)));
    captureException(error);
  }
}

export function* workerCloseModal() {
  try {
    const step = yield select(selectStep);
    const { updatePermissionsUrl } = yield select(getSharedInfo);
    const successUrl = yield select(selectSuccessUrl);

    if (step === STEPS.success.value) {
      yield put(actions.closeModalSuccess());
      window.location.href = `${updatePermissionsUrl}${successUrl}`;
      window.localStorage.removeItem(CHECKOUT);
    } else {
      yield put(actions.closeModalSuccess());
    }
  } catch (error) {
    captureException(error);
  }
}

export function* wokerReload() {
  try {
    const { updatePermissionsUrl } = yield select(getSharedInfo);
    const successUrl = yield select(selectSuccessUrl);
    const checkout = window.localStorage.getItem(CHECKOUT);

    if (checkout) {
      window.localStorage.removeItem(CHECKOUT);
      window.location.href = `${updatePermissionsUrl}${successUrl}`;
    }
  } catch (error) {
    window.localStorage.removeItem(CHECKOUT);
    captureException(error);
  }
}

export function* workerStepsControl(action) {
  const { direction } = action.payload;
  const progressStep = yield select(selectProgressStep);

  if (direction === 'next') {
    yield put(actions.controlStepsFlow(progressStep + 1));
  } else if (direction === 'prev') {
    yield put(actions.controlStepsFlow(progressStep - 1));
  }
}

export default function* subscriptionProductSagas() {
  yield all([
    yield takeLatest(types.SET_SUBSCRIPTION.ACTION, selectProductSagas),
    yield takeLatest(types.FETCH_SUBSCRIPTION.ACTION, wokerSubscriptionProducts),
    yield takeLatest(types.OPEN_MODAL.ACTION, workerOpenModal),
    yield takeLatest(types.LIST_PHYSICIANS.ACTION, workerGetListPhysicians),
    yield takeLatest(types.SELECT_PHYSICIAN.ACTION, workerSelectPhysicianSagas),
    yield takeLatest(types.VERIFICATION_NEXT_STEP.ACTION, workerVerificationProductsWithUsersNext),
    yield takeLatest(types.VERIFICATION_BACK_STEP.ACTION, workerVerificationProductsWithUsersBack),
    yield takeLatest(types.FETCH_CHECKOUT.ACTION, workerCheckout),
    yield takeLatest(types.GET_SUMMARY.ACTION, workerGetSummary),
    yield takeLatest(types.CLOSE_MODAL.ACTION, workerCloseModal),
    yield takeLatest(types.RELOAD.ACTION, wokerReload),
    yield takeLatest(types.SET_STEP.ACTION, workerStepsControl),
  ]);
}

import {
  getProductDefinition,
  formatPeriod,
  getFormattedProductsNames,
  getPhysician,
  getPhysicianPayload,
} from './selectors';

describe('state/billing/subscription/selectors', () => {
  it('should getProductDefinition', () => {
    const productPartialState = {
      slug: 'pro',
      values: {
        monthly: '50.00',
        annual: '800.60',
      },
      promotion: {
        frequencies: {
          annual: {
            value: '500.90',
            frequencyNumber: 1,
            percentage: '50.00',
          },
          monthly: {
            value: '30.50',
            frequencyNumber: 6,
            percentage: '50.00',
          },
        },
      },
      functionalities: [
        { id: 19, name: 'Agenda', slug: 'agenda' },
        { id: 20, name: 'Cadastro de pacientes', slug: 'cadastro-paciente' },
        { id: 21, name: 'Prontuário eletrônico', slug: 'prontuario-eletronico' },
        { id: 22, name: 'Prescrição eletrônica', slug: 'prescricao-eletronica' },
        { id: 23, name: 'Faturamento TISS', slug: 'faturamento-tiss' },
        { id: 24, name: 'Envio de lembretes', slug: 'envio-lembretes' },
        { id: 25, name: 'Controle financeiro', slug: 'controle-financeiro' },
        { id: 26, name: 'Repasse financeiro', slug: 'repasse-financeiro' },
        { id: 27, name: 'Relatórios', slug: 'relatorios' },
        { id: 28, name: 'Logo em documentos', slug: 'logo' },
        { id: 29, name: 'Controle de estoque', slug: 'controle-estoque' },
        { id: 30, name: 'R$ 0,07 por SMS', slug: 'sms' },
        { id: 31, name: '100 SMS gratuitos mês', slug: 'sms-gratis' },
        { id: 32, name: 'SMS com resposta', slug: 'resposta-sms' },
        { id: 33, name: 'Chat interno', slug: 'chat' },
        { id: 34, name: 'Multiprocedimentos', slug: 'multiprocedimentos' },
      ],
    };
    const isMonthly = false;
    const selector = getProductDefinition(isMonthly);

    expect(selector(productPartialState)).toEqual({
      expiration: 'ano',
      percentage: '50',
      suffixValue: '/anual',
      productValue: '801',
      productDiscount: '501',
      frequencyNumber: 1,
      functionalities: [
        { id: 19, name: 'Agenda', slug: 'agenda' },
        { id: 20, name: 'Cadastro de pacientes', slug: 'cadastro-paciente' },
        { id: 21, name: 'Prontuário eletrônico', slug: 'prontuario-eletronico' },
        { id: 22, name: 'Prescrição eletrônica', slug: 'prescricao-eletronica' },
        { id: 23, name: 'Faturamento TISS', slug: 'faturamento-tiss' },
        { id: 24, name: 'Envio de lembretes', slug: 'envio-lembretes' },
        { id: 25, name: 'Controle financeiro', slug: 'controle-financeiro' },
        { id: 26, name: 'Repasse financeiro', slug: 'repasse-financeiro' },
        { id: 27, name: 'Relatórios', slug: 'relatorios' },
        { id: 28, name: 'Logo em documentos', slug: 'logo' },
        { id: 29, name: 'Controle de estoque', slug: 'controle-estoque' },
        { id: 30, name: 'R$ 0,07 por SMS', slug: 'sms' },
        { id: 31, name: '100 SMS gratuitos mês', slug: 'sms-gratis' },
        { id: 32, name: 'SMS com resposta', slug: 'resposta-sms' },
        { id: 33, name: 'Chat interno', slug: 'chat' },
        { id: 34, name: 'Multiprocedimentos', slug: 'multiprocedimentos' },
      ],
    });
  });
  it('should formatPeriod', () => {
    const period = 'monthly';
    const frequencie = 2;
    expect(formatPeriod(period, frequencie)).toEqual('meses');
  });

  it('should getFormattedProductsNames', () => {
    const stateProducts = {
      billing: {
        subscription: {
          productName: ['Pro', 'Marketing'],
          product: ['pro', 'marketing'],
        },
      },
    };

    const productsFormattedNames = 'Plano Pro + Marketing';
    expect(getFormattedProductsNames(stateProducts)).toEqual(productsFormattedNames);
  });

  it('should getPhysician', () => {
    const statePhysician = [
      { profile_id: 211, physician_id: 211, name: 'Bree Harrison' },
      { profile_id: 212, physician_id: 212, name: 'Thaddeus Wiley' },
    ];
    expect(getPhysician(statePhysician)).toEqual(
      [
        { name: 'Selecionar todos usuários', physician_id: 0, profile_id: 0 },
        { profile_id: 211, physician_id: 211, name: 'Bree Harrison' },
        { profile_id: 212, physician_id: 212, name: 'Thaddeus Wiley' },
      ],
    );
  });

  it('should getPhysicianPayload', () => {
    const statePhysician = {
      billing: {
        subscription: {
          physicians: [
            { name: 'Selecionar todos usuários', physician_id: 0, profile_id: 0 },
            { profile_id: 211, physician_id: 211, name: 'Bree Harrison' },
            { profile_id: 212, physician_id: 212, name: 'Thaddeus Wiley' },
          ],
        },
      },
    };
    expect(getPhysicianPayload(statePhysician)).toEqual(
      [
        { profile_id: 211, physician_id: 211, name: 'Bree Harrison' },
        { profile_id: 212, physician_id: 212, name: 'Thaddeus Wiley' },
      ],
    );
  });
});

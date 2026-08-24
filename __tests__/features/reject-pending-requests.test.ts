/**
 * @jest-environment node
 */
const findPendingByUser = jest.fn();
const updateStatus = jest.fn();
const cancelSubscription = jest.fn();
const getSubscription = jest.fn();

jest.mock('@/infra/db/supabase_service', () => ({ supabase_service: {} }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/lib/paypal', () => ({ getPayPalClient: () => ({}) }));
jest.mock('@paypal/paypal-server-sdk', () => ({
  SubscriptionsController: class { cancelSubscription = cancelSubscription; },
}));
jest.mock('@/infra/payments/billing.repository', () => ({
  BillingRepository: { getSubscription },
}));
jest.mock('@/infra/db/subscription-requests.repository', () => ({
  SubscriptionRequestsRepository: { findPendingByUser, updateStatus },
}));
jest.mock('@/infra/db/subscription.repository', () => ({
  SubscriptionRepository: {},
}));

// Se importa después de registrar los mocks para que el servicio reciba los dobles.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { rejectPendingRequests } = require('@/features/payments/services/sync-subscription') as typeof import('@/features/payments/services/sync-subscription');

const solicitud = (id: string, externalId: string | null) => ({
  id, external_subscription_id: externalId, user_id: 'user-1', service_id: 'svc-1', status: 'APPROVAL_PENDING',
});

describe('rejectPendingRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateStatus.mockResolvedValue({ error: null });
    cancelSubscription.mockResolvedValue({});
    getSubscription.mockResolvedValue({ result: { status: 'APPROVAL_PENDING' } });
  });

  it('cancela una solicitud pendiente y la marca rechazada', async () => {
    findPendingByUser.mockResolvedValue({ data: [solicitud('req-1', 'I-1')], error: null });

    await rejectPendingRequests('user-1');

    expect(cancelSubscription).toHaveBeenCalledTimes(1);
    expect(updateStatus.mock.calls[0][1]).toBe('REJECTED');
  });

  /**
   * Ventana real: entre que el usuario aprueba en PayPal y llega el webhook, la
   * solicitud sigue en APPROVAL_PENDING. Cancelarla aquí le anulaba una
   * suscripción que acababa de pagar.
   */
  it('no cancela una suscripción que ya está ACTIVE en PayPal', async () => {
    getSubscription.mockResolvedValue({ result: { status: 'ACTIVE' } });
    findPendingByUser.mockResolvedValue({ data: [solicitud('req-1', 'I-1')], error: null });

    await rejectPendingRequests('user-1');

    expect(cancelSubscription).not.toHaveBeenCalled();
    expect(updateStatus).not.toHaveBeenCalled();
  });

  // Antes se marcaba REJECTED y luego se cancelaba: si la cancelación fallaba,
  // la fila mentía mientras la suscripción seguía viva en PayPal.
  it('no marca rechazada si PayPal no pudo cancelar', async () => {
    cancelSubscription.mockRejectedValue(new Error('paypal caído'));
    findPendingByUser.mockResolvedValue({ data: [solicitud('req-1', 'I-1')], error: null });

    await rejectPendingRequests('user-1');

    expect(updateStatus).not.toHaveBeenCalled();
  });

  // Un fallo cortaba el bucle y dejaba las siguientes sin procesar.
  it('sigue con las demás cuando una falla', async () => {
    cancelSubscription
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({});
    findPendingByUser.mockResolvedValue({
      data: [solicitud('req-1', 'I-1'), solicitud('req-2', 'I-2')], error: null,
    });

    await rejectPendingRequests('user-1');

    expect(cancelSubscription).toHaveBeenCalledTimes(2);
    expect(updateStatus).toHaveBeenCalledTimes(1);
    expect(updateStatus.mock.calls[0][0]).toBe('req-2');
  });

  it('no hace nada si no puede listar las pendientes', async () => {
    findPendingByUser.mockResolvedValue({ data: null, error: { message: 'boom' } });

    await rejectPendingRequests('user-1');

    expect(cancelSubscription).not.toHaveBeenCalled();
    expect(updateStatus).not.toHaveBeenCalled();
  });
});

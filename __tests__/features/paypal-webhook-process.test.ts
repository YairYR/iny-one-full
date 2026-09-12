/**
 * @jest-environment node
 */
import { PG_ERROR } from '@/infra/db/db-errors';

const create = jest.fn();
const setProcessed = jest.fn();
const updateByExternalId = jest.fn();
const afterCallbacks: Array<() => Promise<void>> = [];

jest.mock('@/infra/db/supabase_service', () => ({ supabase_service: {} }));
jest.mock('next/server', () => ({
  after: (cb: () => Promise<void>) => { afterCallbacks.push(cb); },
}));
jest.mock('@/infra/db/webhook.repository', () => ({
  getWebhookRepository: () => ({ create, setProcessed }),
}));
jest.mock('@/infra/db/subscription.repository', () => ({
  SubscriptionRepository: { updateByExternalId },
}));

// Se importa después de registrar los mocks para que el servicio reciba los dobles.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { processPaypalWebhook } = require('@/features/payments/services/webhook') as typeof import('@/features/payments/services/webhook');

function evento(event_type: string, id = 'WH-1') {
  return {
    id, event_type, create_time: '', resource_type: 'subscription',
    event_version: '1.0', summary: 's', links: [],
    resource: { id: 'I-SUB-1' },
  } as never;
}

async function correrAfter() {
  for (const cb of afterCallbacks.splice(0)) await cb();
}

describe('processPaypalWebhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    afterCallbacks.length = 0;
    create.mockResolvedValue({ data: [{ id: 'row-1' }], error: null });
    setProcessed.mockResolvedValue({ error: null });
    updateByExternalId.mockResolvedValue({ data: { id: 'sub-1' }, error: null });
  });

  /**
   * El cuarto argumento es el guard de estados de origen. ACTIVE sólo puede
   * aplicarse sobre una suscripción aún pendiente —si no, un ACTIVATED que llegue
   * tarde resucitaría una cancelada—; el resto de eventos van sin filtro.
   */
  it.each([
    ['BILLING.SUBSCRIPTION.EXPIRED', 'EXPIRED', []],
    ['BILLING.SUBSCRIPTION.CANCELLED', 'CANCELLED', []],
    ['BILLING.SUBSCRIPTION.SUSPENDED', 'SUSPENDED', []],
    ['BILLING.SUBSCRIPTION.ACTIVATED', 'ACTIVE', ['APPROVAL_PENDING', 'APPROVED']],
  ])('%s deja la suscripción en %s', async (eventType, status, guard) => {
    await processPaypalWebhook(evento(eventType));
    await correrAfter();

    expect(updateByExternalId).toHaveBeenCalledWith('I-SUB-1', 'paypal', { status }, guard);
    expect(setProcessed).toHaveBeenCalledWith('row-1');
  });

  /**
   * PayPal reintenta los eventos y `webhook_events.external_event_id` es único:
   * un reintento tiene que ser inocuo. Antes no se comprobaba el error del
   * insert y el segundo intento reventaba con un 500, que provocaba otro
   * reintento.
   */
  it('ignora un evento duplicado sin tocar la suscripción', async () => {
    create.mockResolvedValue({ data: null, error: { code: PG_ERROR.UNIQUE_VIOLATION } });

    await processPaypalWebhook(evento('BILLING.SUBSCRIPTION.CANCELLED'));
    await correrAfter();

    expect(updateByExternalId).not.toHaveBeenCalled();
    expect(setProcessed).not.toHaveBeenCalled();
  });

  /**
   * Regresión: `data[0].id` lanzaba TypeError cuando el insert no devolvía filas,
   * y reventaba antes del guard que debía cubrirlo. Ahora falla de forma
   * controlada: error de dominio, y la suscripción no se toca.
   */
  it('falla de forma controlada si el insert no devuelve filas', async () => {
    create.mockResolvedValue({ data: [], error: null });

    await expect(processPaypalWebhook(evento('BILLING.SUBSCRIPTION.EXPIRED')))
      .rejects.toThrow('Webhook record ID is undefined after creation');
    expect(updateByExternalId).not.toHaveBeenCalled();
  });

  it('un evento sin efecto se registra pero no cambia estado', async () => {
    await processPaypalWebhook(evento('CATALOG.PRODUCT.CREATED'));
    await correrAfter();

    expect(create).toHaveBeenCalledTimes(1);
    expect(updateByExternalId).not.toHaveBeenCalled();
    expect(setProcessed).not.toHaveBeenCalled();
  });

  it('no marca como procesado si la actualización falla', async () => {
    updateByExternalId.mockResolvedValue({ error: { message: 'boom' } });

    await processPaypalWebhook(evento('BILLING.SUBSCRIPTION.EXPIRED'));
    await correrAfter();

    expect(setProcessed).not.toHaveBeenCalled();
  });
});

/**
 * @jest-environment node
 */

type Cadena = Record<string, jest.Mock>;

let mockCadena: Cadena;

jest.mock('@/infra/db/supabase_service', () => ({
  get supabase_service() {
    return mockCadena;
  },
}));

// Se importa después de registrar el mock para que el repositorio reciba el doble.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SubscriptionRepository } = require('@/infra/db/subscription.repository') as typeof import('@/infra/db/subscription.repository');

/** Doble encadenable del query builder: cada método devuelve la propia cadena. */
function nuevaCadena(): Cadena {
  const cadena = {} as Cadena;
  for (const metodo of ['from', 'update', 'select', 'order', 'eq', 'in']) {
    cadena[metodo] = jest.fn(() => cadena);
  }
  cadena.maybeSingle = jest.fn(async () => ({ data: null, error: null }));
  return cadena;
}

beforeEach(() => {
  mockCadena = nuevaCadena();
});

/**
 * Un array de estados vacío significa «sin filtro», no «ningún estado».
 *
 * `.in("status", [])` no casa ninguna fila: convertía el UPDATE en un no-op
 * silencioso. Por ahí se perdieron los webhooks de CANCELLED/EXPIRED/SUSPENDED,
 * que pasan el array vacío porque su guard de estados de origen no aplica: la
 * suscripción se quedaba ACTIVE y el usuario conservaba el acceso de pago.
 */
describe('SubscriptionRepository · filtro opcional de estados', () => {
  it('updateByExternalId no filtra cuando el array viene vacío', async () => {
    await SubscriptionRepository.updateByExternalId('I-SUB-1', 'paypal', { status: 'CANCELLED' }, []);

    expect(mockCadena.in).not.toHaveBeenCalled();
  });

  it('updateByExternalId filtra cuando el array trae estados', async () => {
    await SubscriptionRepository.updateByExternalId('I-SUB-1', 'paypal', { status: 'ACTIVE' }, ['APPROVAL_PENDING', 'APPROVED']);

    expect(mockCadena.in).toHaveBeenCalledWith('status', ['APPROVAL_PENDING', 'APPROVED']);
  });

  it('findByUserId no filtra cuando el array viene vacío', async () => {
    await SubscriptionRepository.findByUserId('user-1', 'svc-1', []);

    expect(mockCadena.in).not.toHaveBeenCalled();
  });

  it('findByUserId filtra cuando el array trae estados', async () => {
    await SubscriptionRepository.findByUserId('user-1', 'svc-1', ['ACTIVE']);

    expect(mockCadena.in).toHaveBeenCalledWith('status', ['ACTIVE']);
  });
});

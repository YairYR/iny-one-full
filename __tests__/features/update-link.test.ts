/**
 * @jest-environment node
 */
import { ValidationError } from '@/lib/api/errors';

const getCurrentUser = jest.fn();
const isOwner = jest.fn();
const changeAlias = jest.fn();
const changeDestination = jest.fn();
const getLinkForEdit = jest.fn();
const logDestinationChange = jest.fn();
const validateDestination = jest.fn();
let mockAccess: { entitlements: Map<string, unknown>; planKey: string | null; anonymous: boolean };

jest.mock('@/infra/db/supabase_service', () => ({ supabase_service: {} }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/infra/db/user.repository', () => ({
  getUserRepository: () => ({ getCurrentUser, isOwner, changeAlias, changeDestination, getLinkForEdit }),
}));
jest.mock('@/infra/db/shorter.repository', () => ({
  getShorterRepository: () => ({ logDestinationChange }),
}));
jest.mock('@/lib/short-links/validate-destination', () => ({
  validateDestination: (...args: unknown[]) => validateDestination(...args),
}));
// El plan efectivo sale del contexto de acceso, que consulta la base: se mockea
// en la frontera, como el resto de repositorios.
jest.mock('@/features/authorization/helpers/access', () => ({
  getAccessContext: () => Promise.resolve(mockAccess),
}));

// Se importa después de registrar los mocks para que la acción reciba los dobles.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { updateLinkAction } = require('@/features/dashboard/actions/edit_link.actions') as typeof import('@/features/dashboard/actions/edit_link.actions');

const SLUG = 'promo-julio';

const state = { slug: SLUG, alias: 'Promo', destination: 'https://old.example/' };

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

describe('updateLinkAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getCurrentUser.mockResolvedValue({ data: { user: { id: 'user-1' }, role: null, plan: 'free' } });
    mockAccess = { entitlements: new Map(), planKey: 'free', anonymous: false };
    isOwner.mockResolvedValue({ data: { slug: SLUG } });
    changeAlias.mockResolvedValue({ error: null });
    changeDestination.mockResolvedValue({ data: [{ slug: SLUG }], error: null });
    logDestinationChange.mockResolvedValue({ error: null });
    getLinkForEdit.mockResolvedValue({
      data: {
        destination: 'https://old.example/?utm_source=instagram&utm_medium=social&utm_campaign=verano',
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'verano',
        utm_term: null,
        utm_content: null,
        utm_id: null,
      },
      error: null,
    });
    validateDestination.mockResolvedValue({ target: 'https://new.example/landing', domain: 'new.example' });
  });

  it('repoints the link to the new destination', async () => {
    const result = await updateLinkAction(state, form({ destination: 'https://new.example/landing' }));

    expect(result.success).toBe(true);
    expect(changeDestination).toHaveBeenCalledTimes(1);
    expect(changeDestination.mock.calls[0][1]).toContain('new.example/landing');
  });

  // El destino guardado es la URL ya compuesta: sin recomponer, cambiarlo
  // borraría las UTM del enlace sin avisar.
  it('keeps the utm parameters when the destination changes', async () => {
    await updateLinkAction(state, form({ destination: 'https://new.example/landing' }));

    const written = new URL(changeDestination.mock.calls[0][1]);
    expect(written.searchParams.get('utm_source')).toBe('instagram');
    expect(written.searchParams.get('utm_medium')).toBe('social');
    expect(written.searchParams.get('utm_campaign')).toBe('verano');
  });

  /**
   * El plan salía del JWT, que no se actualiza al activarse una suscripción. Con
   * él, un suscriptor que editaba un enlace perdía en la reescritura los UTM que
   * su plan sí permite: la edición le degradaba el plan en silencio.
   */
  /** El enlace ya tenía `utm_content` guardado, como lo tendría un suscriptor. */
  function enlaceConUtmContent() {
    getLinkForEdit.mockResolvedValue({
      data: {
        destination: 'https://old.example/?utm_source=instagram&utm_content=boton',
        utm_source: 'instagram',
        utm_medium: null,
        utm_campaign: null,
        utm_term: null,
        utm_content: 'boton',
        utm_id: null,
      },
      error: null,
    });
  }

  it('un suscriptor de pago no pierde utm_content al editar', async () => {
    enlaceConUtmContent();
    mockAccess = { entitlements: new Map(), planKey: 'basic', anonymous: false };

    await updateLinkAction(state, form({ destination: 'https://new.example/landing' }));

    const written = new URL(changeDestination.mock.calls[0][1]);
    expect(written.searchParams.get('utm_content')).toBe('boton');
  });

  it('un usuario del plan gratuito sí pierde utm_content al editar', async () => {
    enlaceConUtmContent();

    await updateLinkAction(state, form({ destination: 'https://new.example/landing' }));

    const written = new URL(changeDestination.mock.calls[0][1]);
    expect(written.searchParams.get('utm_content')).toBeNull();
  });

  // Sin esto el blocklist sería evitable: crear limpio y repuntar después.
  it('rejects a destination that does not pass the shared validation', async () => {
    validateDestination.mockRejectedValue(new ValidationError('Invalid url provided'));

    const result = await updateLinkAction(state, form({ destination: 'https://malware.example' }));

    expect(result.success).toBe(false);
    expect(result.reason).toBe('destination');
    expect(changeDestination).not.toHaveBeenCalled();
  });

  it('always runs the new destination through the shared validation', async () => {
    await updateLinkAction(state, form({ destination: 'https://new.example/landing' }));

    expect(validateDestination).toHaveBeenCalledTimes(1);
    expect(validateDestination.mock.calls[0][0]).toBe('https://new.example/landing');
  });

  it('refuses an edit from someone who does not own the link', async () => {
    isOwner.mockResolvedValue({ data: null });

    const result = await updateLinkAction(state, form({ destination: 'https://new.example/landing' }));

    expect(result.success).toBe(false);
    expect(result.reason).toBe('forbidden');
    expect(changeDestination).not.toHaveBeenCalled();
  });

  it('refuses an edit without a session', async () => {
    getCurrentUser.mockResolvedValue({ data: { user: null, role: null, plan: null } });

    const result = await updateLinkAction(state, form({ alias: 'Otro' }));

    expect(result.success).toBe(false);
    expect(result.reason).toBe('forbidden');
    expect(changeAlias).not.toHaveBeenCalled();
  });

  /**
   * Regresión del fallo silencioso: PostgREST devuelve cero filas y ningún
   * error cuando RLS deniega el update. Darlo por bueno es lo que mantuvo
   * `changeAlias` roto durante meses sin que nadie lo notara.
   */
  it('treats an update that affected no rows as a failure', async () => {
    changeDestination.mockResolvedValue({ data: [], error: null });

    const result = await updateLinkAction(state, form({ destination: 'https://new.example/landing' }));

    expect(result.success).toBe(false);
    expect(result.reason).toBe('destination');
    expect(logDestinationChange).not.toHaveBeenCalled();
  });

  it('records the destination change in the audit trail', async () => {
    await updateLinkAction(state, form({ destination: 'https://new.example/landing' }));

    expect(logDestinationChange).toHaveBeenCalledTimes(1);
    expect(logDestinationChange.mock.calls[0][0]).toMatchObject({
      slug: SLUG,
      oldDestination: 'https://old.example/?utm_source=instagram&utm_medium=social&utm_campaign=verano',
      changedBy: 'user-1',
    });
  });

  it('does not write or audit when the destination did not actually change', async () => {
    validateDestination.mockResolvedValue({ target: 'https://old.example/', domain: 'old.example' });

    const result = await updateLinkAction(state, form({ destination: 'https://old.example/' }));

    expect(result.success).toBe(true);
    expect(changeDestination).not.toHaveBeenCalled();
    expect(logDestinationChange).not.toHaveBeenCalled();
  });

  it('updates only the alias when no destination is submitted', async () => {
    const result = await updateLinkAction(state, form({ alias: 'Campaña de julio' }));

    expect(result.success).toBe(true);
    expect(changeAlias).toHaveBeenCalledWith(SLUG, 'Campaña de julio');
    expect(changeDestination).not.toHaveBeenCalled();
    expect(validateDestination).not.toHaveBeenCalled();
  });

  it('rejects an alias with forbidden characters', async () => {
    const result = await updateLinkAction(state, form({ alias: 'promo<script>' }));

    expect(result.success).toBe(false);
    expect(result.reason).toBe('alias');
    expect(changeAlias).not.toHaveBeenCalled();
  });

  it('applies both fields when both are submitted', async () => {
    const result = await updateLinkAction(
      state,
      form({ alias: 'Julio', destination: 'https://new.example/landing' }),
    );

    expect(result.success).toBe(true);
    expect(changeAlias).toHaveBeenCalledTimes(1);
    expect(changeDestination).toHaveBeenCalledTimes(1);
  });
});

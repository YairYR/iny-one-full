import { fireEvent, render, screen, within } from '@testing-library/react';
import { LinksTable } from '@/features/dashboard/components/LinksTable/LinksTable';
import type { UserUrl } from '@/features/dashboard/types/types';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string, values?: { column?: string }) => values?.column ? `${key}: ${values.column}` : key,
  useFormatter: () => ({
    number: (value: number) => String(value),
    dateTime: (value: Date) => value.toISOString(),
  }),
}));

const links: UserUrl[] = [
  { link_id: '1', slug: 'zebra', alias: 'Alpha', destination: 'https://z.example', clicks: 20, created_at: '2025-02-01T00:00:00Z' },
  { link_id: '2', slug: 'apple', alias: 'Zulu', destination: 'https://a.example', clicks: 3, created_at: '2025-01-01T00:00:00Z' },
  { link_id: '3', slug: 'pear', alias: null, destination: 'https://p.example', clicks: null, created_at: '2025-03-01T00:00:00Z' },
];

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function renderTable(pageSize?: number) {
  const onEdit = jest.fn();
  const onPageChange = jest.fn();
  const onPageSizeChange = jest.fn();
  render(<LinksTable links={links} total={40} page={1} totalPages={2} onPageChange={onPageChange} onEdit={onEdit}
    pageSize={pageSize} onPageSizeChange={onPageSizeChange}
    permissions={{ canEdit: true, canViewStats: true }} />);
  return { onEdit, onPageChange, onPageSizeChange };
}

function slugs() {
  return within(screen.getByRole('table')).getAllByRole('rowheader').map((cell) => cell.textContent);
}

it('filters the selected field only within the loaded page and retains pagination', () => {
  const { onPageChange } = renderTable();
  expect(screen.getByText(/table\.links\.pageOnly/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('table.links.searchField'), { target: { value: 'name' } });
  fireEvent.change(screen.getByLabelText('table.links.search'), { target: { value: 'zulu' } });
  expect(slugs()).toHaveLength(1);
  expect(slugs()[0]).toContain('apple');
  fireEvent.change(screen.getByLabelText('table.links.search'), { target: { value: 'apple' } });
  expect(screen.getByText('table.links.noResults')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'table.links.pagination.next' }));
  expect(onPageChange).toHaveBeenCalledWith(2);
});

it('sorts text, numbers and dates on the current page and exposes the direction', () => {
  renderTable();
  const name = screen.getByRole('button', { name: 'table.links.headers.name' });
  fireEvent.click(name);
  expect(slugs()[0]).toContain('zebra');
  expect(slugs()[2]).toContain('pear');
  expect(name.closest('th')).toHaveAttribute('aria-sort', 'ascending');
  fireEvent.click(name);
  expect(slugs()[0]).toContain('apple');
  expect(slugs()[2]).toContain('pear');
  expect(name.closest('th')).toHaveAttribute('aria-sort', 'descending');

  const clicks = screen.getByRole('button', { name: 'table.links.headers.clicks' });
  fireEvent.click(clicks);
  expect(slugs()[0]).toContain('zebra');
  expect(slugs()[2]).toContain('pear');
  fireEvent.click(clicks);
  expect(slugs()[0]).toContain('apple');
  expect(slugs()[2]).toContain('pear');

  const date = screen.getByRole('button', { name: 'table.links.headers.created' });
  fireEvent.click(date);
  expect(slugs()[0]).toContain('pear');
  fireEvent.click(date);
  expect(slugs()[0]).toContain('apple');
});

it('resizes columns with keyboard or mouse and resets their widths', () => {
  renderTable();
  const resize = screen.getByRole('separator', { name: 'table.links.resize: table.links.headers.name' });
  expect(resize).toHaveAttribute('aria-valuenow', '160');
  fireEvent.keyDown(resize, { key: 'ArrowRight' });
  expect(resize).toHaveAttribute('aria-valuenow', '170');
  fireEvent.mouseDown(resize, { clientX: 100 });
  fireEvent.mouseMove(document, { clientX: 130 });
  fireEvent.mouseUp(document);
  expect(resize).toHaveAttribute('aria-valuenow', '200');
  fireEvent.click(screen.getByRole('button', { name: 'table.links.resetWidths' }));
  expect(resize).toHaveAttribute('aria-valuenow', '160');
});

it('keeps the table structure and height while the first page is loading', () => {
  render(<LinksTable links={[]} total={0} page={1} totalPages={1} isLoading onPageChange={jest.fn()} onEdit={jest.fn()} />);
  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.getAllByRole('status').every((element) => element.textContent === 'loading')).toBe(true);
  const loadingRegion = screen.getAllByRole('region').find((element) => element.hasAttribute('aria-busy'));
  expect(loadingRegion).toHaveClass('h-[clamp(18rem,62dvh,44rem)]');
});

it('asks the server for the selected page size instead of hiding loaded rows', () => {
  const { onPageSizeChange } = renderTable(10);
  expect(screen.getByLabelText('table.links.rowSize')).toHaveValue('10');
  fireEvent.change(screen.getByLabelText('table.links.rowSize'), { target: { value: '5' } });
  expect(onPageSizeChange).toHaveBeenCalledWith(5);
  // Cada fila recibida se muestra: recortar en cliente dejaba filas inaccesibles.
  expect(slugs()).toHaveLength(3);
});

it('opens the same row actions using right click or the visible button', async () => {
  const { onEdit } = renderTable();
  const row = screen.getByRole('row', { name: /zebra/ });
  fireEvent.contextMenu(row);
  const menu = await screen.findByRole('menu');
  fireEvent.click(within(menu).getByRole('menuitem', { name: 'tools.edit' }));
  expect(onEdit).toHaveBeenCalledWith(links[0]);
  fireEvent.click(screen.getByRole('button', { name: 'tools.openMenu: apple' }));
  expect(await screen.findByRole('menu')).toBeInTheDocument();
  fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /tools.details/ }));
  expect(push).toHaveBeenCalledWith('/dashboard/link/details?id=2');
});

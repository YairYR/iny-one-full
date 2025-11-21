import { render } from '@testing-library/react'
import Page from '@/app/(ui)/(main)/page';

jest.mock('next/navigation');

describe('Page', () => {
  it('renders a heading', () => {
    const { container } = render(<Page />)
    expect(container).toMatchSnapshot();
  })
})
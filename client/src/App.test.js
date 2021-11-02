import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main large header', () => {
  render(<App />);
  const buttonElement = screen.getByText(/SafeStake/i);
  expect(buttonElement).toBeInTheDocument();
});

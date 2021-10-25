import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading web3', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Loading Web3/i);
  expect(buttonElement).toBeInTheDocument();
});

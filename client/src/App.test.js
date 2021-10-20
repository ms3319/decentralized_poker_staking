import { render, screen } from '@testing-library/react';
import App from './App';

test('renders add myself to list button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Add myself to list/i);
  expect(buttonElement).toBeInTheDocument();
});

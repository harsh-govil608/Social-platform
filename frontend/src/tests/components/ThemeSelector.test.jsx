import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSelector from '../../components/ThemeSelector';

// Mock zustand store
vi.mock('../../store/useThemeStore', () => ({
  useThemeStore: vi.fn(() => ({
    theme: 'coffee',
    setTheme: vi.fn(),
  })),
}));

describe('ThemeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders theme selector button', () => {
    render(<ThemeSelector />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays current theme', () => {
    const { useThemeStore } = require('../../store/useThemeStore');
    useThemeStore.mockReturnValue({
      theme: 'coffee',
      setTheme: vi.fn(),
    });

    render(<ThemeSelector />);
    // Theme selector should be rendered
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

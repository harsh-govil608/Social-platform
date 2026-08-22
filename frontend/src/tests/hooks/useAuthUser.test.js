import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the axios instance
vi.mock('../../lib/axios', () => ({
  axiosInstance: {
    get: vi.fn(),
  },
}));

describe('useAuthUser hook', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should handle loading state', async () => {
    const { axiosInstance } = await import('../../lib/axios');
    axiosInstance.get.mockImplementation(() => new Promise(() => {}));

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const useAuthUser = (await import('../../hooks/useAuthUser')).default;
    const { result } = renderHook(() => useAuthUser(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('should fetch authenticated user', async () => {
    const mockUser = {
      _id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      isOnboarded: true
    };

    const { axiosInstance } = await import('../../lib/axios');
    axiosInstance.get.mockResolvedValue({ data: mockUser });

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const useAuthUser = (await import('../../hooks/useAuthUser')).default;
    const { result } = renderHook(() => useAuthUser(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.authUser).toEqual(mockUser);
  });
});

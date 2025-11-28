import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }));

  it('should initialize with first page', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.paginatedItems.length).toBe(10);
    expect(result.current.totalPages).toBe(10);
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it('should navigate to previous page', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it('should not go below page 1', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should not exceed total pages', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));

    act(() => {
      result.current.goToPage(100);
    });

    expect(result.current.currentPage).toBe(10);
  });

  it('should calculate canGoPrev correctly', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));

    expect(result.current.canGoPrev).toBe(false);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.canGoPrev).toBe(true);
  });

  it('should calculate canGoNext correctly', () => {
    const { result } = renderHook(() => usePagination(mockItems, 10));

    expect(result.current.canGoNext).toBe(true);

    act(() => {
      result.current.goToPage(10);
    });

    expect(result.current.canGoNext).toBe(false);
  });

  it('should handle empty items array', () => {
    const { result } = renderHook(() => usePagination([], 10));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.paginatedItems.length).toBe(0);
  });

  it('should reset to page 1 when items change', () => {
    const { result, rerender } = renderHook(
      ({ items }) => usePagination(items, 10),
      {
        initialProps: { items: mockItems },
      }
    );

    act(() => {
      result.current.goToPage(5);
    });

    expect(result.current.currentPage).toBe(5);

    const newItems = mockItems.slice(0, 50);
    rerender({ items: newItems });

    expect(result.current.currentPage).toBe(1);
  });
});

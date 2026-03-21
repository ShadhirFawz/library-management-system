import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyBorrowings from '@/pages/member/MyBorrowings';
import MyReservations from '@/pages/member/MyReservations';
import MyFines from '@/pages/member/MyFines';

// Mock the useApi hook
vi.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    orders: {
      getMy: vi.fn().mockResolvedValue({
        orders: [
          {
            _id: 'order1',
            userId: 'user1',
            bookCopyId: 'copy1',
            bookId: 'book1',
            borrowDate: '2024-01-01T00:00:00.000Z',
            dueDate: '2024-01-15T00:00:00.000Z',
            status: 'borrowed',
            fineAmount: 0,
          },
        ],
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
      }),
    },
    reservations: {
      getMy: vi.fn().mockResolvedValue({
        reservations: [
          {
            _id: 'res1',
            userId: 'user1',
            bookId: 'book1',
            reservationDate: '2024-01-01T00:00:00.000Z',
            status: 'pending',
          },
        ],
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
      }),
      cancel: vi.fn().mockResolvedValue({ message: 'Cancelled' }),
    },
    fines: {
      getMy: vi.fn().mockResolvedValue({
        fines: [
          {
            _id: 'fine1',
            orderId: 'order1',
            userId: 'user1',
            amount: 5.0,
            reason: '3 days overdue',
            isPaid: false,
            createdAt: '2024-01-20T00:00:00.000Z',
          },
        ],
        unpaidTotal: 5.0,
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
      }),
      pay: vi.fn().mockResolvedValue({ message: 'Paid' }),
    },
  }),
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MyBorrowings Page', () => {
  it('renders the page title', async () => {
    renderWithRouter(<MyBorrowings />);

    await waitFor(() => {
      expect(screen.getByText('My Borrowings')).toBeInTheDocument();
    });
  });

  it('displays borrowed orders in table', async () => {
    renderWithRouter(<MyBorrowings />);

    await waitFor(() => {
      expect(screen.getByText('book1')).toBeInTheDocument();
    });
  });

  it('shows status badge', async () => {
    renderWithRouter(<MyBorrowings />);

    await waitFor(() => {
      expect(screen.getByText('BORROWED')).toBeInTheDocument();
    });
  });
});

describe('MyReservations Page', () => {
  it('renders the page title', async () => {
    renderWithRouter(<MyReservations />);

    await waitFor(() => {
      expect(screen.getByText('My Reservations')).toBeInTheDocument();
    });
  });

  it('displays reservations in table', async () => {
    renderWithRouter(<MyReservations />);

    await waitFor(() => {
      expect(screen.getByText('book1')).toBeInTheDocument();
    });
  });

  it('shows cancel button for pending reservations', async () => {
    renderWithRouter(<MyReservations />);

    await waitFor(() => {
      const cancelButton = screen.getByTitle('Cancel');
      expect(cancelButton).toBeInTheDocument();
    });
  });
});

describe('MyFines Page', () => {
  it('renders the page title', async () => {
    renderWithRouter(<MyFines />);

    await waitFor(() => {
      expect(screen.getByText('My Fines')).toBeInTheDocument();
    });
  });

  it('displays unpaid total when fines exist', async () => {
    renderWithRouter(<MyFines />);

    await waitFor(() => {
      expect(screen.getByText(/Outstanding Balance/)).toBeInTheDocument();
      expect(screen.getByText('$5.00')).toBeInTheDocument();
    });
  });

  it('shows pay button for unpaid fines', async () => {
    renderWithRouter(<MyFines />);

    await waitFor(() => {
      const payButton = screen.getByTitle('Pay');
      expect(payButton).toBeInTheDocument();
    });
  });
});

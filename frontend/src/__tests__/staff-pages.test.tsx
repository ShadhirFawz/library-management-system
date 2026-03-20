import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BorrowingOrders from '@/pages/staff/BorrowingOrders';
import Reservations from '@/pages/staff/Reservations';
import Fines from '@/pages/staff/Fines';

// Mock the useApi hook
const mockOrders = {
  getAll: vi.fn().mockResolvedValue({
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
    pagination: { total: 1, page: 1, limit: 20, pages: 1 },
  }),
  borrow: vi.fn().mockResolvedValue({ message: 'Borrowed', order: {} }),
  return: vi.fn().mockResolvedValue({ message: 'Returned' }),
};

const mockReservations = {
  getAll: vi.fn().mockResolvedValue({
    reservations: [
      {
        _id: 'res1',
        userId: 'user1',
        bookId: 'book1',
        reservationDate: '2024-01-01T00:00:00.000Z',
        status: 'pending',
      },
    ],
    pagination: { total: 1, page: 1, limit: 20, pages: 1 },
  }),
  approve: vi.fn().mockResolvedValue({ message: 'Approved', reservation: {}, order: {} }),
  reject: vi.fn().mockResolvedValue({ message: 'Rejected' }),
};

const mockFines = {
  getAll: vi.fn().mockResolvedValue({
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
    pagination: { total: 1, page: 1, limit: 20, pages: 1 },
  }),
  pay: vi.fn().mockResolvedValue({ message: 'Paid' }),
};

vi.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    orders: mockOrders,
    reservations: mockReservations,
    fines: mockFines,
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

describe('BorrowingOrders Staff Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    renderWithRouter(<BorrowingOrders />);

    await waitFor(() => {
      expect(screen.getByText('Borrowing Orders')).toBeInTheDocument();
    });
  });

  it('displays Issue Borrow button', async () => {
    renderWithRouter(<BorrowingOrders />);

    await waitFor(() => {
      expect(screen.getByText('Issue Borrow')).toBeInTheDocument();
    });
  });

  it('shows return button for borrowed orders', async () => {
    renderWithRouter(<BorrowingOrders />);

    await waitFor(() => {
      const returnButton = screen.getByTitle('Return');
      expect(returnButton).toBeInTheDocument();
    });
  });

  it('opens issue modal when clicking Issue Borrow', async () => {
    renderWithRouter(<BorrowingOrders />);

    await waitFor(() => {
      const issueButton = screen.getByText('Issue Borrow');
      fireEvent.click(issueButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Issue New Borrow')).toBeInTheDocument();
    });
  });
});

describe('Reservations Staff Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    renderWithRouter(<Reservations />);

    await waitFor(() => {
      expect(screen.getByText('Reservations')).toBeInTheDocument();
    });
  });

  it('displays reservations in table', async () => {
    renderWithRouter(<Reservations />);

    await waitFor(() => {
      expect(screen.getByText('book1')).toBeInTheDocument();
    });
  });

  it('shows approve and reject buttons for pending reservations', async () => {
    renderWithRouter(<Reservations />);

    await waitFor(() => {
      const approveButton = screen.getByTitle('Approve & Issue');
      const rejectButton = screen.getByTitle('Reject');
      expect(approveButton).toBeInTheDocument();
      expect(rejectButton).toBeInTheDocument();
    });
  });
});

describe('Fines Staff Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', async () => {
    renderWithRouter(<Fines />);

    await waitFor(() => {
      expect(screen.getByText('Fines')).toBeInTheDocument();
    });
  });

  it('displays fines in table', async () => {
    renderWithRouter(<Fines />);

    await waitFor(() => {
      expect(screen.getByText('3 days overdue')).toBeInTheDocument();
    });
  });

  it('shows mark paid button for unpaid fines', async () => {
    renderWithRouter(<Fines />);

    await waitFor(() => {
      const payButton = screen.getByTitle('Mark Paid');
      expect(payButton).toBeInTheDocument();
    });
  });
});

// ============================
// Mock Data for LibraManage
// ============================

export interface Address {
  street: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  phone: string;
  address: Address;
  profileImage: string;
  status: 'ACTIVE' | 'SUSPENDED';
  membershipId: string | null;
  lastLogin: string;
  createdAt: string;
}

export interface Membership {
  _id: string;
  name: string;
  maxBorrowLimit: number;
  borrowDurationDays: number;
  finePerDay: number;
  membershipDurationMonths: number;
  description: string;
}

export interface Author {
  _id: string;
  name: string;
  biography: string;
  nationality: string;
  birthDate: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  parentCategoryId: string | null;
}

export interface BookLocation {
  shelf: string;
  rack: string;
  floor: string;
}

export interface Book {
  _id: string;
  title: string;
  isbn: string;
  authorIds: string[];
  categoryIds: string[];
  publisher: string;
  publishedYear: number;
  language: string;
  pages: number;
  totalCopies: number;
  availableCopies: number;
  coverImage: string;
  description: string;
  location: BookLocation;
}

export interface BookCopy {
  _id: string;
  bookId: string;
  barcode: string;
  status: 'AVAILABLE' | 'BORROWED' | 'LOST' | 'DAMAGED';
  condition: string;
  purchasedDate: string;
}

export interface BorrowOrder {
  _id: string;
  userId: string;
  bookCopyId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  fineAmount: number;
}

export interface Reservation {
  _id: string;
  userId: string;
  bookId: string;
  reservationDate: string;
  expiryDate: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
}

export interface Fine {
  _id: string;
  userId: string;
  borrowOrderId: string;
  amount: number;
  reason: string;
  status: 'UNPAID' | 'PAID';
  issuedDate: string;
  paidDate: string | null;
}

export interface TicketMessage {
  _id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  _id: string;
  subject: string;
  description: string;
  raisedBy: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminResponse?: string | null;
  respondedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const FAQ_CATEGORIES = ['borrowing', 'returning', 'account', 'ordering', 'general'] as const;

export interface Article {
  _id: string;
  title: string;
  content: string;
  category?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserMembership {
  _id: string;
  userId: string;
  membershipId: string;
  startDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

// ---- MOCK INSTANCES ----

export const mockMemberships: Membership[] = [
  { _id: 'mem1', name: 'Standard', maxBorrowLimit: 3, borrowDurationDays: 14, finePerDay: 0.50, membershipDurationMonths: 12, description: 'Basic membership with standard borrowing privileges.' },
  { _id: 'mem2', name: 'Premium', maxBorrowLimit: 7, borrowDurationDays: 30, finePerDay: 0.25, membershipDurationMonths: 12, description: 'Premium membership with extended limits and lower fines.' },
  { _id: 'mem3', name: 'Student', maxBorrowLimit: 5, borrowDurationDays: 21, finePerDay: 0.10, membershipDurationMonths: 6, description: 'Discounted membership for students with valid ID.' },
];

export const mockAuthors: Author[] = [
  { _id: 'auth1', name: 'Andrew Hunt', biography: 'Author of The Pragmatic Programmer.', nationality: 'American', birthDate: '1964-03-15' },
  { _id: 'auth2', name: 'Robert C. Martin', biography: 'Software engineer and author known as Uncle Bob.', nationality: 'American', birthDate: '1952-12-05' },
  { _id: 'auth3', name: 'Martin Fowler', biography: 'Software developer and author specializing in OOD.', nationality: 'British', birthDate: '1963-12-18' },
  { _id: 'auth4', name: 'Joshua Bloch', biography: 'Author of Effective Java, former Sun engineer.', nationality: 'American', birthDate: '1961-08-28' },
  { _id: 'auth5', name: 'Erich Gamma', biography: 'Co-author of Design Patterns (Gang of Four).', nationality: 'Swiss', birthDate: '1961-03-13' },
];

export const mockCategories: Category[] = [
  { _id: 'cat1', name: 'Technology', description: 'Books about software, hardware, and tech.', parentCategoryId: null },
  { _id: 'cat2', name: 'Science', description: 'Scientific literature and textbooks.', parentCategoryId: null },
  { _id: 'cat3', name: 'Fiction', description: 'Novels and fictional works.', parentCategoryId: null },
  { _id: 'cat4', name: 'Programming', description: 'Software development books.', parentCategoryId: 'cat1' },
  { _id: 'cat5', name: 'Databases', description: 'Database design and management.', parentCategoryId: 'cat1' },
];

export const mockBooks: Book[] = [
  { _id: 'book1', title: 'The Pragmatic Programmer', isbn: '978-0135957059', authorIds: ['auth1'], categoryIds: ['cat1', 'cat4'], publisher: 'Addison-Wesley', publishedYear: 2019, language: 'English', pages: 352, totalCopies: 5, availableCopies: 2, coverImage: '', description: 'A guide to becoming a better programmer.', location: { shelf: 'A1', rack: 'R3', floor: '2' } },
  { _id: 'book2', title: 'Clean Code', isbn: '978-0132350884', authorIds: ['auth2'], categoryIds: ['cat1', 'cat4'], publisher: 'Prentice Hall', publishedYear: 2008, language: 'English', pages: 464, totalCopies: 3, availableCopies: 1, coverImage: '', description: 'A handbook of agile software craftsmanship.', location: { shelf: 'A1', rack: 'R3', floor: '2' } },
  { _id: 'book3', title: 'Refactoring', isbn: '978-0134757599', authorIds: ['auth3'], categoryIds: ['cat1', 'cat4'], publisher: 'Addison-Wesley', publishedYear: 2018, language: 'English', pages: 448, totalCopies: 4, availableCopies: 3, coverImage: '', description: 'Improving the design of existing code.', location: { shelf: 'A2', rack: 'R1', floor: '2' } },
  { _id: 'book4', title: 'Effective Java', isbn: '978-0134685991', authorIds: ['auth4'], categoryIds: ['cat1', 'cat4'], publisher: 'Addison-Wesley', publishedYear: 2018, language: 'English', pages: 416, totalCopies: 6, availableCopies: 4, coverImage: '', description: 'Best practices for the Java programming language.', location: { shelf: 'B1', rack: 'R2', floor: '1' } },
  { _id: 'book5', title: 'Design Patterns', isbn: '978-0201633610', authorIds: ['auth5'], categoryIds: ['cat1', 'cat4'], publisher: 'Addison-Wesley', publishedYear: 1994, language: 'English', pages: 395, totalCopies: 2, availableCopies: 0, coverImage: '', description: 'Elements of reusable object-oriented software.', location: { shelf: 'B1', rack: 'R2', floor: '1' } },
  { _id: 'book6', title: 'The Clean Coder', isbn: '978-0137081073', authorIds: ['auth2'], categoryIds: ['cat1'], publisher: 'Prentice Hall', publishedYear: 2011, language: 'English', pages: 256, totalCopies: 3, availableCopies: 2, coverImage: '', description: 'A code of conduct for professional programmers.', location: { shelf: 'A1', rack: 'R4', floor: '2' } },
  { _id: 'book7', title: 'UML Distilled', isbn: '978-0321193681', authorIds: ['auth3'], categoryIds: ['cat1'], publisher: 'Addison-Wesley', publishedYear: 2003, language: 'English', pages: 208, totalCopies: 2, availableCopies: 2, coverImage: '', description: 'A brief guide to the standard object modeling language.', location: { shelf: 'C1', rack: 'R1', floor: '3' } },
  { _id: 'book8', title: 'Java Concurrency in Practice', isbn: '978-0321349606', authorIds: ['auth4'], categoryIds: ['cat4'], publisher: 'Addison-Wesley', publishedYear: 2006, language: 'English', pages: 384, totalCopies: 3, availableCopies: 1, coverImage: '', description: 'Thread safety and performance.', location: { shelf: 'B2', rack: 'R3', floor: '1' } },
];

export const mockUsers: User[] = [
  { _id: 'usr1', fullName: 'John Admin', email: 'admin@libramanage.com', role: 'ADMIN', phone: '+1-555-0101', address: { street: '100 Main St', city: 'New York', district: 'Manhattan', postalCode: '10001', country: 'USA' }, profileImage: '', status: 'ACTIVE', membershipId: null, lastLogin: '2025-03-18T09:00:00Z', createdAt: '2024-01-01T00:00:00Z' },
  { _id: 'usr2', fullName: 'Sarah Librarian', email: 'librarian@libramanage.com', role: 'LIBRARIAN', phone: '+1-555-0102', address: { street: '200 Oak Ave', city: 'Boston', district: 'Back Bay', postalCode: '02116', country: 'USA' }, profileImage: '', status: 'ACTIVE', membershipId: null, lastLogin: '2025-03-17T14:30:00Z', createdAt: '2024-02-15T00:00:00Z' },
  { _id: 'usr3', fullName: 'Alice Member', email: 'alice@example.com', role: 'MEMBER', phone: '+1-555-0103', address: { street: '50 Elm St', city: 'Chicago', district: 'Lincoln Park', postalCode: '60614', country: 'USA' }, profileImage: '', status: 'ACTIVE', membershipId: 'mem1', lastLogin: '2025-03-18T11:00:00Z', createdAt: '2024-03-10T00:00:00Z' },
  { _id: 'usr4', fullName: 'Bob Reader', email: 'bob@example.com', role: 'MEMBER', phone: '+1-555-0104', address: { street: '75 Pine Rd', city: 'San Francisco', district: 'Mission', postalCode: '94110', country: 'USA' }, profileImage: '', status: 'ACTIVE', membershipId: 'mem2', lastLogin: '2025-03-16T08:45:00Z', createdAt: '2024-04-20T00:00:00Z' },
  { _id: 'usr5', fullName: 'Charlie Scholar', email: 'charlie@example.com', role: 'MEMBER', phone: '+1-555-0105', address: { street: '30 College Blvd', city: 'Austin', district: 'Downtown', postalCode: '73301', country: 'USA' }, profileImage: '', status: 'SUSPENDED', membershipId: 'mem3', lastLogin: '2025-02-28T16:00:00Z', createdAt: '2024-05-05T00:00:00Z' },
  { _id: 'usr6', fullName: 'Diana Bookworm', email: 'diana@example.com', role: 'MEMBER', phone: '+1-555-0106', address: { street: '12 Library Ln', city: 'Seattle', district: 'Capitol Hill', postalCode: '98102', country: 'USA' }, profileImage: '', status: 'ACTIVE', membershipId: 'mem1', lastLogin: '2025-03-15T10:00:00Z', createdAt: '2024-06-12T00:00:00Z' },
];

export const mockBookCopies: BookCopy[] = [
  { _id: 'bc1', bookId: 'book1', barcode: 'LIB-001-001', status: 'AVAILABLE', condition: 'Good', purchasedDate: '2023-01-15' },
  { _id: 'bc2', bookId: 'book1', barcode: 'LIB-001-002', status: 'BORROWED', condition: 'Good', purchasedDate: '2023-01-15' },
  { _id: 'bc3', bookId: 'book2', barcode: 'LIB-002-001', status: 'AVAILABLE', condition: 'Fair', purchasedDate: '2022-06-10' },
  { _id: 'bc4', bookId: 'book2', barcode: 'LIB-002-002', status: 'LOST', condition: 'N/A', purchasedDate: '2022-06-10' },
  { _id: 'bc5', bookId: 'book3', barcode: 'LIB-003-001', status: 'AVAILABLE', condition: 'Excellent', purchasedDate: '2023-03-20' },
  { _id: 'bc6', bookId: 'book4', barcode: 'LIB-004-001', status: 'DAMAGED', condition: 'Poor', purchasedDate: '2021-09-01' },
  { _id: 'bc7', bookId: 'book5', barcode: 'LIB-005-001', status: 'BORROWED', condition: 'Good', purchasedDate: '2023-07-14' },
  { _id: 'bc8', bookId: 'book6', barcode: 'LIB-006-001', status: 'AVAILABLE', condition: 'Good', purchasedDate: '2024-01-05' },
];

export const mockBorrowOrders: BorrowOrder[] = [
  { _id: 'bo1', userId: 'usr3', bookCopyId: 'bc2', borrowDate: '2025-03-01', dueDate: '2025-03-15', returnDate: null, status: 'OVERDUE', fineAmount: 1.50 },
  { _id: 'bo2', userId: 'usr4', bookCopyId: 'bc7', borrowDate: '2025-03-10', dueDate: '2025-04-09', returnDate: null, status: 'BORROWED', fineAmount: 0 },
  { _id: 'bo3', userId: 'usr3', bookCopyId: 'bc3', borrowDate: '2025-02-01', dueDate: '2025-02-15', returnDate: '2025-02-14', status: 'RETURNED', fineAmount: 0 },
  { _id: 'bo4', userId: 'usr6', bookCopyId: 'bc5', borrowDate: '2025-03-05', dueDate: '2025-03-19', returnDate: null, status: 'BORROWED', fineAmount: 0 },
  { _id: 'bo5', userId: 'usr5', bookCopyId: 'bc1', borrowDate: '2025-01-10', dueDate: '2025-01-31', returnDate: '2025-02-05', status: 'RETURNED', fineAmount: 2.50 },
];

export const mockReservations: Reservation[] = [
  { _id: 'res1', userId: 'usr3', bookId: 'book5', reservationDate: '2025-03-12', expiryDate: '2025-03-19', status: 'PENDING' },
  { _id: 'res2', userId: 'usr4', bookId: 'book1', reservationDate: '2025-03-10', expiryDate: '2025-03-17', status: 'FULFILLED' },
  { _id: 'res3', userId: 'usr6', bookId: 'book2', reservationDate: '2025-03-08', expiryDate: '2025-03-15', status: 'EXPIRED' },
  { _id: 'res4', userId: 'usr5', bookId: 'book4', reservationDate: '2025-03-14', expiryDate: '2025-03-21', status: 'PENDING' },
];

export const mockFines: Fine[] = [
  { _id: 'fine1', userId: 'usr3', borrowOrderId: 'bo1', amount: 1.50, reason: 'Overdue return', status: 'UNPAID', issuedDate: '2025-03-16', paidDate: null },
  { _id: 'fine2', userId: 'usr5', borrowOrderId: 'bo5', amount: 2.50, reason: 'Late return by 5 days', status: 'PAID', issuedDate: '2025-02-05', paidDate: '2025-02-10' },
  { _id: 'fine3', userId: 'usr4', borrowOrderId: 'bo2', amount: 15.00, reason: 'Book damage fee', status: 'UNPAID', issuedDate: '2025-03-12', paidDate: null },
];

export const mockSupportTickets: SupportTicket[] = [
  {
    _id: 'tkt1', userId: 'usr3', subject: 'Cannot access my borrowing history', category: 'Technical', priority: 'HIGH', status: 'OPEN', assignedTo: 'usr2',
    messages: [
      { _id: 'msg1', senderId: 'usr3', senderName: 'Alice Member', message: 'I cannot see my past borrowings. The page shows an error.', timestamp: '2025-03-15T10:00:00Z' },
      { _id: 'msg2', senderId: 'usr2', senderName: 'Sarah Librarian', message: 'We are looking into this issue. Can you try clearing your browser cache?', timestamp: '2025-03-15T11:30:00Z' },
    ],
    createdAt: '2025-03-15T10:00:00Z', updatedAt: '2025-03-15T11:30:00Z',
  },
  {
    _id: 'tkt2', userId: 'usr4', subject: 'Request for new book acquisition', category: 'General', priority: 'LOW', status: 'IN_PROGRESS', assignedTo: 'usr2',
    messages: [
      { _id: 'msg3', senderId: 'usr4', senderName: 'Bob Reader', message: 'I would like to request "System Design Interview" by Alex Xu.', timestamp: '2025-03-14T09:00:00Z' },
    ],
    createdAt: '2025-03-14T09:00:00Z', updatedAt: '2025-03-14T09:00:00Z',
  },
  {
    _id: 'tkt3', userId: 'usr6', subject: 'Fine dispute', category: 'Billing', priority: 'MEDIUM', status: 'OPEN', assignedTo: null,
    messages: [
      { _id: 'msg4', senderId: 'usr6', senderName: 'Diana Bookworm', message: 'I returned the book on time but was still charged a fine. Please review.', timestamp: '2025-03-16T14:00:00Z' },
    ],
    createdAt: '2025-03-16T14:00:00Z', updatedAt: '2025-03-16T14:00:00Z',
  },
];

export const mockArticles: Article[] = [
  { _id: 'art1', title: 'How to renew books online', content: 'To renew books, go to My Borrowings and click renew...', category: 'Help', createdBy: 'usr2', createdAt: '2025-03-10T09:00:00Z' },
  { _id: 'art2', title: 'Membership benefits explained', content: 'Premium members enjoy extended borrow limits...', category: 'Membership', createdBy: 'usr1', createdAt: '2025-02-20T08:30:00Z' },
  { _id: 'art3', title: 'Library internet access', content: 'Free Wi-Fi is available at all branches...', category: 'Facilities', createdBy: 'usr2', createdAt: '2025-01-15T12:00:00Z' },
];

export const mockUserMemberships: UserMembership[] = [
  { _id: 'um1', userId: 'usr3', membershipId: 'mem1', startDate: '2025-01-01', expiryDate: '2026-01-01', status: 'ACTIVE' },
  { _id: 'um2', userId: 'usr4', membershipId: 'mem2', startDate: '2025-02-01', expiryDate: '2026-02-01', status: 'ACTIVE' },
  { _id: 'um3', userId: 'usr5', membershipId: 'mem3', startDate: '2024-09-01', expiryDate: '2025-03-01', status: 'EXPIRED' },
  { _id: 'um4', userId: 'usr6', membershipId: 'mem1', startDate: '2025-03-01', expiryDate: '2026-03-01', status: 'ACTIVE' },
];

// Helper functions for cross-service lookups
export const getUserName = (userId: string): string => mockUsers.find(u => u._id === userId)?.fullName ?? 'Unknown';
export const getBookTitle = (bookId: string): string => mockBooks.find(b => b._id === bookId)?.title ?? 'Unknown';
export const getBookByBookCopyId = (bookCopyId: string) => {
  const copy = mockBookCopies.find(c => c._id === bookCopyId);
  if (!copy) return { title: 'Unknown', barcode: 'N/A' };
  const book = mockBooks.find(b => b._id === copy.bookId);
  return { title: book?.title ?? 'Unknown', barcode: copy.barcode };
};
export const getMembershipName = (membershipId: string | null): string => {
  if (!membershipId) return 'None';
  return mockMemberships.find(m => m._id === membershipId)?.name ?? 'Unknown';
};
export const getAuthorName = (authorId: string): string => mockAuthors.find(a => a._id === authorId)?.name ?? 'Unknown';
export const getCategoryName = (categoryId: string): string => mockCategories.find(c => c._id === categoryId)?.name ?? 'Unknown';

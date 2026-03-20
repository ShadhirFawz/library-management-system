import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { BookCopy } from "@/data/mockData";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";

const BookInventory = () => {
  const [bookCopies, setBookCopies] = useState<BookCopy[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  useEffect(() => {
    fetchInventory();
    fetchBooks();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.inventory.getAll();
      setBookCopies(data.bookCopies || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch inventory");
      toast({
        title: "Error loading inventory",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const data = await api.books.getAll();
      setBooks(data.books || []);
    } catch (err: any) {
      console.error("Failed to fetch books:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const bookId = formData.get("bookId") as string;
      const barcode = formData.get("barcode") as string;
      const location = formData.get("location") as string;
      const condition = formData.get("condition") as string;
      const status = formData.get("status") as string;

      const copyData = {
        barcode,
        location: location || undefined,
        condition: condition || "good",
        status: status || undefined,
      };

      if (edit) {
        await api.inventory.update(edit._id, copyData);
        toast({ title: "Copy updated successfully" });
      } else {
        await api.inventory.create({
          bookId,
          ...copyData,
        });
        toast({ title: "Copy added successfully" });
      }

      setModalOpen(false);
      setEdit(null);
      await fetchInventory();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this book copy?")) return;
    try {
      await api.inventory.delete(id);
      toast({ title: "Copy deleted successfully" });
      await fetchInventory();
    } catch (err: any) {
      toast({
        title: "Error deleting copy",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getBookTitle = (bookId: any) => {
    if (typeof bookId === "object" && bookId?.title) {
      return bookId.title;
    }
    return bookId;
  };

  const columns: ColumnDef<BookCopy>[] = [
    {
      accessorKey: "barcode",
      header: "Barcode",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{row.original.barcode}</span>
      ),
    },
    {
      accessorKey: "bookId",
      header: "Book",
      cell: ({ row }) => getBookTitle(row.original.bookId),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status?.toUpperCase() || "AVAILABLE"}
        />
      ),
    },
    { accessorKey: "condition", header: "Condition" },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {new Date(row.original.createdAt || "").toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button
            onClick={() => {
              setEdit(row.original);
              setModalOpen(true);
            }}
            className="p-1.5 text-accent hover:bg-muted rounded transition-colors"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => handleDelete(row.original._id)}
            className="p-1.5 text-destructive hover:bg-muted rounded transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  if (loading)
    return <div className="text-center py-8">Loading inventory...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-destructive">Error: {error}</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Book Inventory</h1>
          <p className="text-muted-foreground text-sm">
            Track individual book copies
          </p>
        </div>
        <button
          onClick={() => {
            setEdit(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Add Copy
        </button>
      </div>
      <DataTable title="All Copies" data={bookCopies} columns={columns} />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={edit ? "Edit Copy" : "Add Book Copy"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!edit && (
            <div>
              <label className="block text-sm font-medium mb-1">Book</label>
              <select
                name="bookId"
                className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
                required={!edit}
              >
                <option value="">Select a book</option>
                {books.map((book) => (
                  <option key={book._id} value={book._id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Barcode</label>
            <input
              type="text"
              name="barcode"
              defaultValue={edit?.barcode}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              required
              placeholder="Enter barcode"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              name="location"
              defaultValue={edit?.location}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              placeholder="e.g., A3-12 (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              name="condition"
              defaultValue={edit?.condition || "good"}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
            >
              <option value="good">Good</option>
              <option value="new">New</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          {edit && (
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                defaultValue={edit?.status || "available"}
                className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              >
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
                <option value="lost">Lost</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Saving..." : edit ? "Update Copy" : "Add Copy"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookInventory;

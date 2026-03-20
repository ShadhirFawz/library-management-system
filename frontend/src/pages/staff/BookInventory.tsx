import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { BookCopy } from "@/data/mockData";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";

const BookInventory = () => {
  const [bookCopies, setBookCopies] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const api = useApi();

  useEffect(() => {
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
    fetchInventory();
  }, []);

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
  ];

  if (loading)
    return <div className="text-center py-8">Loading inventory...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-destructive">Error: {error}</div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Book Inventory</h1>
        <p className="text-muted-foreground text-sm">
          Track individual book copies
        </p>
      </div>
      <DataTable title="All Copies" data={bookCopies} columns={columns} />
    </div>
  );
};

export default BookInventory;

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { getAuthorName, getCategoryName, Book } from "@/data/mockData";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";

const BookCatalog = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const api = useApi();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksData, authorsData, categoriesData] = await Promise.all([
        api.books.getAll(),
        api.authors.getAll(),
        api.categories.getAll(),
      ]);

      const transformedBooks =
        booksData.books?.map((book: any) => ({
          ...book,
          authorIds: Array.isArray(book.authors)
            ? book.authors.map((a: any) => (typeof a === "string" ? a : a._id))
            : [],
          categoryIds: Array.isArray(book.categories)
            ? book.categories.map((c: any) =>
                typeof c === "string" ? c : c._id,
              )
            : [],
          publishedYear: book.publicationYear || book.publishedYear,
        })) || [];

      setBooks(transformedBooks);
      setAuthors(authorsData.authors || []);
      setCategories(categoriesData.categories || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      toast({
        title: "Error loading data",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const isbn = formData.get("isbn") as string;
      const description = formData.get("description") as string;
      const publisher = formData.get("publisher") as string;
      const publicationYear = formData.get("publicationYear") as string;
      const language = formData.get("language") as string;
      const pages = formData.get("pages") as string;
      const authorIds = formData.getAll("authors") as string[];
      const categoryIds = formData.getAll("categories") as string[];

      const bookData = {
        title,
        isbn,
        description,
        publisher,
        publicationYear: publicationYear
          ? parseInt(publicationYear)
          : undefined,
        language,
        pages: pages ? parseInt(pages) : undefined,
        authors: authorIds,
        categories: categoryIds,
      };

      if (edit) {
        await api.books.update(edit._id, bookData);
        toast({ title: "Book updated" });
      } else {
        await api.books.create(bookData);
        toast({ title: "Book created" });
      }
      setModalOpen(false);
      setEdit(null);
      await fetchData();
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
    if (!confirm("Delete this book?")) return;
    try {
      await api.books.delete(id);
      toast({ title: "Book deleted" });
      await fetchData();
    } catch (err: any) {
      toast({
        title: "Error deleting book",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Book>[] = [
    { accessorKey: "title", header: "Title" },
    {
      accessorKey: "isbn",
      header: "ISBN",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.isbn}</span>
      ),
    },
    {
      id: "authors",
      header: "Authors",
      cell: ({ row }) => row.original.authorIds.map(getAuthorName).join(", "),
    },
    {
      id: "categories",
      header: "Categories",
      cell: ({ row }) =>
        row.original.categoryIds.map(getCategoryName).join(", "),
    },
    { accessorKey: "publisher", header: "Publisher" },
    {
      accessorKey: "publishedYear",
      header: "Year",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.publishedYear}</span>
      ),
    },
    { accessorKey: "totalCopies", header: "Total" },
    {
      accessorKey: "availableCopies",
      header: "Available",
      cell: ({ row }) => (
        <span
          className={
            row.original.availableCopies > 0
              ? "text-success font-bold"
              : "text-destructive font-bold"
          }
        >
          {row.original.availableCopies}
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Book Catalog</h1>
          <p className="text-muted-foreground text-sm">
            Manage your library's collection
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
          Add Book
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading books...</div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">Error: {error}</div>
      ) : (
        <DataTable title="All Books" data={books} columns={columns} />
      )}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={edit ? "Edit Book" : "Add New Book"}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              defaultValue={edit?.title}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ISBN</label>
            <input
              name="isbn"
              defaultValue={edit?.isbn}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Publisher</label>
            <input
              name="publisher"
              defaultValue={edit?.publisher}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Published Year
            </label>
            <input
              type="number"
              name="publicationYear"
              defaultValue={edit?.publishedYear}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <input
              name="language"
              defaultValue={edit?.language || "English"}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pages</label>
            <input
              type="number"
              name="pages"
              defaultValue={edit?.pages}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={edit?.description}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent col-span-2"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Authors</label>
            <select
              name="authors"
              multiple
              defaultValue={edit?.authorIds}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent h-20"
            >
              {authors.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <select
              name="categories"
              multiple
              defaultValue={edit?.categoryIds}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent h-20"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex justify-end gap-3">
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
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookCatalog;

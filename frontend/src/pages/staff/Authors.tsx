import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Author } from "@/data/mockData";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";

const Authors = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<Author | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const data = await api.authors.getAll();
      setAuthors(data.authors || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading authors",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const bio = formData.get("bio") as string;
      const birthYear = formData.get("birthYear") as string;
      const nationality = formData.get("nationality") as string;

      if (edit) {
        await api.authors.update(edit._id, {
          name,
          bio,
          birthYear: birthYear ? parseInt(birthYear) : undefined,
          nationality,
        });
        toast({ title: "Author updated" });
      } else {
        await api.authors.create({
          name,
          bio,
          birthYear: birthYear ? parseInt(birthYear) : undefined,
          nationality,
        });
        toast({ title: "Author created" });
      }
      setModalOpen(false);
      setEdit(null);
      await fetchAuthors();
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
    if (!confirm("Delete this author?")) return;
    try {
      await api.authors.delete(id);
      toast({ title: "Author deleted" });
      await fetchAuthors();
    } catch (err: any) {
      toast({
        title: "Error deleting author",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Author>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "nationality", header: "Nationality" },
    {
      id: "birthYear",
      header: "Birth Year",
      cell: ({ row }) => (row.original as any).birthYear || "N/A",
    },
    {
      id: "bio",
      header: "Biography",
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate block">
          {(row.original as any).bio || ""}
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
          <h1 className="text-2xl font-bold">Authors</h1>
          <p className="text-muted-foreground text-sm">Manage book authors</p>
        </div>
        <button
          onClick={() => {
            setEdit(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Add Author
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading authors...</div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">Error: {error}</div>
      ) : (
        <DataTable title="All Authors" data={authors} columns={columns} />
      )}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={edit ? "Edit Author" : "Add Author"}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              defaultValue={edit?.name}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Nationality
            </label>
            <input
              name="nationality"
              defaultValue={edit?.nationality}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Birth Year</label>
            <input
              type="number"
              name="birthYear"
              defaultValue={(edit as any)?.birthYear}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Biography</label>
            <textarea
              name="bio"
              defaultValue={(edit as any)?.bio || edit?.biography}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              rows={3}
            />
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

export default Authors;

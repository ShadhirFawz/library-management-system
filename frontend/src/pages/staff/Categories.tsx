import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Category } from "@/data/mockData";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";

const Categories = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.categories.getAll();
      setCategories(data.categories || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading categories",
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
      const description = formData.get("description") as string;

      if (edit) {
        await api.categories.update(edit._id, {
          name,
          description,
        });
        toast({ title: "Category updated" });
      } else {
        await api.categories.create({ name, description });
        toast({ title: "Category created" });
      }
      setModalOpen(false);
      setEdit(null);
      await fetchCategories();
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
    if (!confirm("Delete this category?")) return;
    try {
      await api.categories.delete(id);
      toast({ title: "Category deleted" });
      await fetchCategories();
    } catch (err: any) {
      toast({
        title: "Error deleting category",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Category>[] = [
    { accessorKey: "name", header: "Category Name" },
    { accessorKey: "description", header: "Description" },
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
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground text-sm">
            Organize books by category
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
          Add Category
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading categories...</div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">Error: {error}</div>
      ) : (
        <DataTable title="All Categories" data={categories} columns={columns} />
      )}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={edit ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
              Description
            </label>
            <textarea
              name="description"
              defaultValue={edit?.description}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              rows={3}
            />
          </div>
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
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;

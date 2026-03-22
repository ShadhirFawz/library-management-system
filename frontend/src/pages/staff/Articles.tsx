import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import { Article, getUserName, FAQ_CATEGORIES } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { Loader } from 'lucide-react';

const StaffArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [editing, setEditing] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.articles.getAll();
      setArticles(data.articles || []);
    } catch (err) {
      const msg = String((err as any)?.message || '');
      if (/not found|404/i.test(msg)) {
        setArticles([]);
      } else {
        toast({ title: 'Failed to load articles', variant: 'destructive' });
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setIsCreating(true); setEditing(null); setTitle(''); setContent(''); setCategory(''); setSelected(null); };

  const saveArticle = async () => {
    if (!title.trim() || !content.trim()) return toast({ title: 'Title and content required', variant: 'destructive' });
    setSaving(true);
    try {
      if (editing) {
        await api.articles.update(editing._id, { title, content, category });
        toast({ title: 'Article updated' });
      } else {
        await api.articles.create({ title, content, category });
        toast({ title: 'Article created' });
      }
      setIsCreating(false);
      setEditing(null);
      setSelected(null);
      await loadArticles();
    } catch (err) {
      const msg = String((err as any)?.message || '');
      if (/not found|404/i.test(msg)) {
        toast({ title: 'Article not found', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to save article', variant: 'destructive' });
        console.error(err);
      }
    } finally {
      setSaving(false);
    }
  };

  const removeArticle = async (id: string) => {
    try {
      await api.articles.delete(id);
      setArticles(a => a.filter(x => x._id !== id));
      toast({ title: 'Article deleted' });
    } catch (err) {
      toast({ title: 'Failed to delete article', variant: 'destructive' });
      console.error(err);
    }
  };

  const columns: ColumnDef<Article>[] = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'category', header: 'Category' },
    { id: 'createdBy', header: 'Author', cell: ({ row }) => row.original.createdBy || getUserName(row.original.createdBy) },
    { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
    {
      id: 'actions', header: '', cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => setSelected(row.original)} className="text-accent text-sm hover:underline">View</button>
          <button onClick={() => { setEditing(row.original); setTitle(row.original.title); setContent(row.original.content); setCategory(row.original.category || ''); }} className="text-primary text-sm hover:underline">Edit</button>
          <button onClick={() => removeArticle(row.original._id)} className="text-destructive text-sm hover:underline">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FAQ</h1>
          <p className="text-muted-foreground text-sm">Manage frequently asked questions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreate} className="px-3 py-2 bg-primary text-primary-foreground rounded text-sm">New FAQ</button>
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader className="h-4 w-4 animate-spin" /> Loading FAQs...</div>}
      {!loading && <DataTable title="FAQ" data={articles} columns={columns} />}

      <Modal isOpen={!!selected || editing !== null || isCreating} onClose={() => { setSelected(null); setEditing(null); setIsCreating(false); }} title={selected ? selected.title : (editing ? 'Edit FAQ' : 'New FAQ')}>
        {selected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">By {getUserName(selected.createdBy)} · {new Date(selected.createdAt).toLocaleString()}</p>
            <div className="prose max-w-none">{selected.content}</div>
          </div>
        ) : (
          <div className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full border border-border px-3 py-2 rounded" disabled={saving} />
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-border px-3 py-2 rounded" disabled={saving}>
              <option value="">-- Select Category --</option>
              {FAQ_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" className="w-full border border-border px-3 py-2 rounded h-40" disabled={saving} />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setEditing(null); setSelected(null); setIsCreating(false); }} className="px-3 py-2 border rounded" disabled={saving}>Cancel</button>
              <button onClick={saveArticle} disabled={saving} className="px-3 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50">
                {saving ? <Loader className="h-4 w-4 animate-spin inline mr-2" /> : null}
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffArticles;

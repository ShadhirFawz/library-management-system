import { useEffect, useState } from 'react';
import { Loader, Plus } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Article, getUserName, FAQ_CATEGORIES } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const MemberArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const api = useApi();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.articles.getAll(category || undefined);
        setArticles(data.articles || []);
      } catch (err: any) {
        console.error(err);
        const msg = String(err?.message || '');
        if (/not found|404/i.test(msg)) {
          // no articles in DB for this query
          setArticles([]);
        } else {
          toast({ title: 'Failed to load FAQs', variant: 'destructive' });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category]);

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">FAQ</h1>
          <p className="text-muted-foreground text-sm">Frequently asked questions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-border px-3 py-2 rounded text-sm"
          >
            <option value="">All categories</option>
            {FAQ_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => navigate('/member/support')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 shadow-sm transition-shadow"
            aria-label="Raise a support ticket"
          >
            <Plus className="h-4 w-4" />
            Raise a ticket
          </button>
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader className="h-4 w-4 animate-spin" /> Loading...</div>}

      {!loading && articles.length === 0 && (
        <div className="text-sm text-muted-foreground">No FAQs found.</div>
      )}

      <div className="space-y-4">
        {articles.map((a) => (
          <div key={a._id} className="border border-border rounded p-4">
            <div>
              <h3 className="font-semibold text-lg">{a.title}</h3>
            </div>
            <div className="prose mt-3 max-w-none text-sm" dangerouslySetInnerHTML={{ __html: a.content }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberArticles;

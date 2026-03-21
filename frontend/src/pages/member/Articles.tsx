import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Article, getUserName } from '@/data/mockData';

const MemberArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const api = useApi();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.articles.getAll();
        setArticles(data.articles || []);
      } catch (err) {
        console.error(err);
        toast({ title: 'Failed to load FAQs', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">FAQ</h1>
        <p className="text-muted-foreground text-sm">Frequently asked questions</p>
      </div>

      {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader className="h-4 w-4 animate-spin" /> Loading...</div>}

      {!loading && articles.length === 0 && (
        <div className="text-sm text-muted-foreground">No FAQs found.</div>
      )}

      <div className="space-y-4">
        {articles.map((a) => (
          <div key={a._id} className="border border-border rounded p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{a.title}</h3>
                <p className="text-xs text-muted-foreground">{a.category ? a.category.charAt(0).toUpperCase() + a.category.slice(1) : 'General'} · {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="prose mt-3 max-w-none text-sm" dangerouslySetInnerHTML={{ __html: a.content }} />
            <p className="text-xs text-muted-foreground mt-3">By {getUserName(a.createdBy)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberArticles;

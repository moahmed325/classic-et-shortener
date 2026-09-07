'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Link2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkCard, LinkItem } from '@/components/link-card';
import { linksApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface RecentLinksProps {
  limit?: number;
  refreshTrigger?: number;
  onLinkCreatedClick?: () => void;
}

export function RecentLinks({ limit = 5, refreshTrigger = 0, onLinkCreatedClick }: RecentLinksProps) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, [limit, refreshTrigger]);

  const fetchLinks = async () => {
    try {
      const response = await linksApi.getAll({ limit });
      setLinks(response.links);
      setTotalCount(response.links.length);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load recent links',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (updated: LinkItem) => {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 font-sans">Recent Links</h2>
          {totalCount > 0 && (
            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 font-medium">
              {totalCount}
            </span>
          )}
        </div>

        <Link
          href="/dashboard/links"
          className="group inline-flex items-center gap-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 font-medium transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-border-subtle bg-surface-1 p-4 animate-pulse space-y-2"
            >
              <div className="h-4 bg-surface-2 rounded w-1/3" />
              <div className="h-3 bg-surface-2 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : links.length === 0 ? (
        /* Disciplined Empty State (No cartoonish illustrations) */
        <div className="rounded-md border border-border-subtle bg-surface-1 p-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded border border-border-subtle bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 mb-3">
            <Link2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 font-sans">No links created yet</h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
            Paste any long URL into the command shortener above to generate your first tracked short link.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onLinkCreatedClick}
              className="min-h-[44px] border border-border-subtle bg-surface-1 hover:bg-surface-2 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-medium"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5 text-[#ff6363]" />
              Create your first short link
            </Button>
          </div>
        </div>
      ) : (
        /* Link Cards List */
        <div className="space-y-2.5">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

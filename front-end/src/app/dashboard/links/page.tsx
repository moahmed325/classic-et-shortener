'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Link2, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LinkCard, LinkItem } from '@/components/link-card';
import { linksApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type StatusFilter = 'all' | 'active' | 'expired' | 'inactive';
type SortOption = 'recent' | 'clicks' | 'alphabetical';

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isLoading, setIsLoading] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, []);

  // Global ⌘K / Ctrl+K keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await linksApi.getAll({ limit: 1000 });
      setLinks(response.links);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load links feed',
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
  };

  // Filter & Sort Logic
  const filteredAndSortedLinks = useMemo(() => {
    const now = new Date();

    const filtered = links.filter((link) => {
      // Search matching
      const matchesSearch =
        !searchQuery.trim() ||
        link.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.title && link.title.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const isExpired = Boolean(link.expiresAt && new Date(link.expiresAt) < now);

      // Status filtering
      if (statusFilter === 'active') {
        return link.isActive && !isExpired;
      }
      if (statusFilter === 'expired') {
        return isExpired;
      }
      if (statusFilter === 'inactive') {
        return !link.isActive;
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'clicks') {
        return b.clickCount - a.clickCount;
      }
      if (sortBy === 'alphabetical') {
        const titleA = a.title || a.shortCode;
        const titleB = b.title || b.shortCode;
        return titleA.localeCompare(titleB);
      }
      // default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [links, searchQuery, statusFilter, sortBy]);

  const activeFilterLabel = {
    all: 'All Links',
    active: 'Active',
    expired: 'Expired',
    inactive: 'Inactive',
  }[statusFilter];

  const activeSortLabel = {
    recent: 'Recent',
    clicks: 'Most Clicked',
    alphabetical: 'Alphabetical',
  }[sortBy];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#ededed] font-sans">Links</h1>
          <p className="text-xs sm:text-sm text-[#8c8d91] font-sans mt-0.5">
            Manage your short URLs, inspect click analytics, and configure destinations.
          </p>
        </div>

        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto min-h-[44px] bg-[#ff6363] hover:bg-[#ff4d4d] text-white text-xs sm:text-sm font-medium px-4">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Link
          </Button>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Fast Search Input with ⌘K Indicator */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8c8d91]" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search by title, URL, or shortcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[44px] pl-9 pr-14 bg-[#141517] border-[#27282b] text-base sm:text-sm text-[#ededed] placeholder:text-[#8c8d91] focus-visible:ring-1 focus-visible:ring-[#56c2ff] rounded-md"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center">
            <Kbd className="bg-[#1c1d20] border-[#27282b] text-[#8c8d91] text-[10px] px-1.5 py-0.5">⌘K</Kbd>
          </div>
        </div>

        {/* Status Filter & Sort Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-h-[44px] flex-1 sm:flex-initial border-[#27282b] bg-[#141517] hover:bg-[#1c1d20] text-[#ededed] text-xs font-mono justify-between gap-2"
              >
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-[#8c8d91]" />
                  <span>{activeFilterLabel}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[#8c8d91]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-[#141517] border-[#27282b] text-[#ededed] p-1 shadow-none"
            >
              <DropdownMenuItem
                onClick={() => setStatusFilter('all')}
                className={`min-h-[44px] cursor-pointer text-xs font-mono px-3 ${statusFilter === 'all' ? 'bg-[#1c1d20] text-[#56c2ff]' : ''}`}
              >
                All Links
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter('active')}
                className={`min-h-[44px] cursor-pointer text-xs font-mono px-3 ${statusFilter === 'active' ? 'bg-[#1c1d20] text-[#5fc992]' : ''}`}
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter('expired')}
                className={`min-h-[44px] cursor-pointer text-xs font-mono px-3 ${statusFilter === 'expired' ? 'bg-[#1c1d20] text-[#ff6363]' : ''}`}
              >
                Expired
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter('inactive')}
                className={`min-h-[44px] cursor-pointer text-xs font-mono px-3 ${statusFilter === 'inactive' ? 'bg-[#1c1d20] text-[#f59e0b]' : ''}`}
              >
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort By */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-h-[44px] flex-1 sm:flex-initial border-[#27282b] bg-[#141517] hover:bg-[#1c1d20] text-[#ededed] text-xs font-mono justify-between gap-2"
              >
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-[#8c8d91]" />
                  <span>{activeSortLabel}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[#8c8d91]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-[#141517] border-[#27282b] text-[#ededed] p-1 shadow-none"
            >
              <DropdownMenuItem
                onClick={() => setSortBy('recent')}
                className={`min-h-[44px] cursor-pointer text-xs font-mono px-3 ${sortBy === 'recent' ? 'bg-[#1c1d20] text-[#56c2ff]' : ''}`}
              >
                Recent
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('clicks')}
                className={`min-h-[44px] cursor-pointer text-xs font-mono px-3 ${sortBy === 'clicks' ? 'bg-[#1c1d20] text-[#56c2ff]' : ''}`}
              >
                Most Clicked
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('alphabetical')}
                className={`min-h-[44px] cursor-pointer text-xs font-mono px-3 ${sortBy === 'alphabetical' ? 'bg-[#1c1d20] text-[#56c2ff]' : ''}`}
              >
                Alphabetical
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Feed List */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-[#27282b] bg-[#141517] p-4 animate-pulse space-y-2"
            >
              <div className="h-4 bg-[#1c1d20] rounded w-1/4" />
              <div className="h-3 bg-[#1c1d20] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedLinks.length === 0 ? (
        /* Disciplined Empty State */
        <div className="rounded-md border border-[#27282b] bg-[#141517] p-10 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded border border-[#27282b] bg-[#1c1d20] text-[#8c8d91] mb-3">
            <Link2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#ededed] font-sans">
            {searchQuery ? 'No links match your filter' : 'No short links yet'}
          </h3>
          <p className="mt-1 text-xs text-[#8c8d91] max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search query or clear the active status filter.'
              : 'Create your first short link from the command center to begin tracking clicks.'}
          </p>
          <div className="mt-4">
            {searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="min-h-[44px] border-[#27282b] bg-[#1c1d20] hover:bg-[#25262a] text-[#ededed] text-xs font-mono"
              >
                Clear Search & Filters
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="min-h-[44px] bg-[#ff6363] hover:bg-[#ff4d4d] text-white text-xs font-mono"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Create your first short link
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredAndSortedLinks.map((link) => (
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

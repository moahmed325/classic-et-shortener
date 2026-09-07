'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Shield, 
  Key, 
  Save, 
  Loader2, 
  Copy, 
  Check, 
  ArrowUpRight,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/api';

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'api'>('profile');

  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Security fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // API fields
  const [apiKey, setApiKey] = useState('sk_live_classic_' + (user?.id ? user.id.replace(/-/g, '').slice(0, 16) : '8472910482910482'));
  const [isApiKeyCopied, setIsApiKeyCopied] = useState(false);
  const [isApiKeyRevealed, setIsApiKeyRevealed] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !isValidEmail(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsProfileSaving(true);
    try {
      const response = await authApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
      });

      if (updateUser && response.user) {
        updateUser(response.user);
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile changes have been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Could not update profile details.',
        variant: 'destructive',
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords mismatch',
        description: 'New password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsPasswordSaving(true);
    try {
      await authApi.updatePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: 'Password updated',
        description: 'Your login credentials have been refreshed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating password',
        description: error.message || 'Please verify your current password.',
        variant: 'destructive',
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setIsApiKeyCopied(true);
      toast({
        title: 'API key copied',
        description: 'Key saved to clipboard.',
      });
      setTimeout(() => setIsApiKeyCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateApiKey = async () => {
    setIsGeneratingKey(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const rand = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
      setApiKey(`sk_live_${rand}`);
      toast({
        title: 'New API key generated',
        description: 'Remember to update your webhook or worker configurations.',
      });
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const currentTier = user?.tier || 'free';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
          Configure personal credentials, security keys, and developer access.
        </p>
      </div>

      {/* Plan Status Banner */}
      <div className="rounded-md border border-border-subtle bg-surface-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[#ff6363]">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                Subscription Plan:
              </span>
              <Kbd className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-[#5fc992] text-xs font-mono uppercase font-bold">
                {currentTier}
              </Kbd>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans mt-0.5">
              {currentTier === 'premium'
                ? 'Unlimited redirects, custom domains, and raw telemetry export.'
                : currentTier === 'pro'
                ? 'High-volume redirect throughput and extended retention.'
                : 'Basic free tier with standard community analytics.'}
            </p>
          </div>
        </div>

        <Link href="/dashboard/subscription">
          <Button
            variant="outline"
            className="w-full sm:w-auto min-h-[44px] border border-border-subtle bg-surface-1 hover:bg-surface-2 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-medium shadow-sm"
          >
            <span>Manage Plan</span>
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
          </Button>
        </Link>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border-subtle pb-2 overflow-x-auto [webkit-overflow-scrolling:touch]">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`min-h-[44px] sm:min-h-[40px] px-4 text-xs font-mono rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-surface-1 text-zinc-950 dark:text-zinc-50 border border-border-subtle shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-surface-2 font-medium'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`min-h-[44px] sm:min-h-[40px] px-4 text-xs font-mono rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-surface-1 text-zinc-950 dark:text-zinc-50 border border-border-subtle shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-surface-2 font-medium'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('api')}
          className={`min-h-[44px] sm:min-h-[40px] px-4 text-xs font-mono rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'api'
              ? 'bg-surface-1 text-zinc-950 dark:text-zinc-50 border border-border-subtle shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-surface-2 font-medium'
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          <span>Developer API</span>
        </button>
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="rounded-md border border-border-subtle bg-surface-1 p-5 sm:p-6 space-y-5 animate-in fade-in-50 duration-150">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
              Personal Information
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-0.5">
              Public account identifier and contact details
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                Display Name
              </Label>
              <Input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mohammed Ahmed"
                className="min-h-[44px] bg-surface-1 border border-border-subtle text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                Email Address
              </Label>
              <Input
                id="profile-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="min-h-[44px] bg-surface-1 border border-border-subtle text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-bio" className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                Bio / Team Note
              </Label>
              <Textarea
                id="profile-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Operational notes or developer bio..."
                className="bg-surface-1 border border-border-subtle text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={isProfileSaving}
              className="min-h-[44px] bg-[#ff6363] hover:bg-[#ff4d4d] text-white text-xs font-mono px-5 shadow-sm"
            >
              {isProfileSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="rounded-md border border-border-subtle bg-surface-1 p-5 sm:p-6 space-y-5 animate-in fade-in-50 duration-150">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
              Change Password
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-0.5">
              Must be at least 6 characters and differ from existing password
            </p>
          </div>

          <form onSubmit={handlePasswordSave} className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <Label htmlFor="curr-pass" className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="curr-pass"
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="min-h-[44px] pr-12 bg-surface-1 border border-border-subtle text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  aria-label={showCurrentPass ? "Hide current password" : "Show current password"}
                  className="absolute right-0 top-0 bottom-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-pass" className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-pass"
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="min-h-[44px] pr-12 bg-surface-1 border border-border-subtle text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  aria-label={showNewPass ? "Hide new password" : "Show new password"}
                  className="absolute right-0 top-0 bottom-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pass" className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirm-pass"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="min-h-[44px] bg-surface-1 border border-border-subtle text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={isPasswordSaving}
              className="min-h-[44px] bg-[#ff6363] hover:bg-[#ff4d4d] text-white text-xs font-mono px-5 shadow-sm"
            >
              {isPasswordSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Tab: Developer API */}
      {activeTab === 'api' && (
        <div className="rounded-md border border-border-subtle bg-surface-1 p-5 sm:p-6 space-y-5 animate-in fade-in-50 duration-150">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
              API Credentials
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-0.5">
              Use your API secret key to programmatically generate short links
            </p>
          </div>

          <div className="space-y-3 max-w-xl">
            <Label className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
              Secret API Key
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type={isApiKeyRevealed ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="min-h-[44px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-900 dark:text-zinc-100 pr-12 select-all"
                />
                <button
                  type="button"
                  onClick={() => setIsApiKeyRevealed(!isApiKeyRevealed)}
                  aria-label={isApiKeyRevealed ? "Hide API key" : "Show API key"}
                  className="absolute right-0 top-0 bottom-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {isApiKeyRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={copyApiKey}
                className="min-h-[44px] px-3 border border-border-subtle bg-surface-1 hover:bg-surface-2 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-medium flex items-center gap-1.5 shadow-sm"
              >
                {isApiKeyCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-[#5fc992]" />
                    <span className="text-emerald-600 dark:text-[#5fc992] font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isGeneratingKey}
                onClick={handleGenerateApiKey}
                className="min-h-[44px] border border-border-subtle bg-surface-1 hover:bg-surface-2 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-medium shadow-sm"
              >
                {isGeneratingKey ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                )}
                Rotate API Key
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

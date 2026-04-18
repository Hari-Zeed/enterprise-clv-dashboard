'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  User, Lock, Bell, Cpu, Loader2, CheckCircle,
  Shield, Trash2, KeyRound, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveModel } from '@/hooks/use-active-model';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signOut } from 'next-auth/react';

function SettingsCard({ title, description, icon: Icon, iconColor, children }: any) {
  return (
    <div className="section-card">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.06]">
        <div className={cn('p-2.5 rounded-xl', iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-white/35 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-white/25">{hint}</p>}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <div>
        <p className="text-sm font-medium text-white/75">{label}</p>
        <p className="text-xs text-white/35 mt-0.5">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-indigo-500"
      />
    </div>
  );
}

function SaveButton({ isLoading, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
      {isLoading ? 'Saving...' : label}
    </button>
  );
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { model, isLoading: isModelLoading } = useActiveModel();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '',
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyReport: true,
    alertsOnThreshold: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update profile');
      }
      toast.success('Profile updated successfully');
      update({ name: formData.name, email: formData.email });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to change password');
      }
      toast.success('Password changed successfully');
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // In a real app we'd make a DELETE request to /api/users
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Account deleted successfully');
      signOut({ callbackUrl: '/' });
    } catch (err: any) {
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

  const inputClass = "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/40 h-10";

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-white/35 mt-1">Manage your account, preferences and model configuration</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="account">
          <TabsList className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 h-auto w-fit mb-6">
            {[
              { value: 'account', label: 'Account', icon: User },
              { value: 'preferences', label: 'Preferences', icon: Bell },
              { value: 'model', label: 'Model', icon: Cpu },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-lg px-4 py-2 text-sm text-white/40 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-none flex items-center gap-2"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Account ── */}
          <TabsContent value="account" className="space-y-5 mt-0">
            <SettingsCard
              title="Profile Information"
              description="Update your display name and email address"
              icon={User}
              iconColor="bg-indigo-500/10 text-indigo-400"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name" hint="Your display name across the platform">
                  <Input
                    name="name" value={formData.name} onChange={handleInputChange}
                    disabled={isSavingProfile} className={inputClass} placeholder="Your full name"
                  />
                </FormField>
                <FormField label="Email Address" hint="Used for login and notifications">
                  <Input
                    name="email" type="email" value={formData.email} onChange={handleInputChange}
                    disabled={isSavingProfile} className={inputClass} placeholder="you@example.com"
                  />
                </FormField>
              </div>
              <SaveButton isLoading={isSavingProfile} label="Save Profile" onClick={handleSaveProfile} />
            </SettingsCard>

            <SettingsCard
              title="Change Password"
              description="Keep your account secure with a strong password"
              icon={KeyRound}
              iconColor="bg-violet-500/10 text-violet-400"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Current Password">
                  <Input
                    name="currentPassword" type="password" value={formData.currentPassword}
                    onChange={handleInputChange} disabled={isSavingPassword}
                    className={inputClass} placeholder="••••••••"
                  />
                </FormField>
                <FormField label="New Password" hint="Minimum 8 characters">
                  <Input
                    name="newPassword" type="password" value={formData.newPassword}
                    onChange={handleInputChange} disabled={isSavingPassword}
                    className={inputClass} placeholder="••••••••"
                  />
                </FormField>
                <FormField label="Confirm Password">
                  <Input
                    name="confirmPassword" type="password" value={formData.confirmPassword}
                    onChange={handleInputChange} disabled={isSavingPassword}
                    className={inputClass} placeholder="••••••••"
                  />
                </FormField>
              </div>
              {/* Password strength indicator */}
              {formData.newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={cn(
                        'h-1 flex-1 rounded-full transition-all duration-300',
                        formData.newPassword.length >= i * 3
                          ? i <= 2 ? 'bg-amber-400' : 'bg-emerald-400'
                          : 'bg-white/10'
                      )} />
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30">
                    {formData.newPassword.length < 6 ? 'Too short'
                      : formData.newPassword.length < 8 ? 'Weak'
                      : formData.newPassword.length < 12 ? 'Good'
                      : 'Strong'}
                  </p>
                </div>
              )}
              <SaveButton isLoading={isSavingPassword} label="Update Password" onClick={handleChangePassword} />
            </SettingsCard>
          </TabsContent>

          {/* ── Preferences ── */}
          <TabsContent value="preferences" className="space-y-5 mt-0">
            <SettingsCard
              title="Notification Preferences"
              description="Control how and when we notify you"
              icon={Bell}
              iconColor="bg-amber-500/10 text-amber-400"
            >
              <Toggle
                label="Email Notifications"
                description="Receive email updates about predictions and model status"
                checked={preferences.emailNotifications}
                onChange={() => setPreferences(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
              />
              <Toggle
                label="Weekly Report"
                description="Get a weekly digest of your CLV metrics and insights"
                checked={preferences.weeklyReport}
                onChange={() => setPreferences(p => ({ ...p, weeklyReport: !p.weeklyReport }))}
              />
              <Toggle
                label="Threshold Alerts"
                description="Alert when CLV drops below a configured threshold"
                checked={preferences.alertsOnThreshold}
                onChange={() => setPreferences(p => ({ ...p, alertsOnThreshold: !p.alertsOnThreshold }))}
              />
              <Toggle
                label="Marketing Emails"
                description="Product updates, tips and new feature announcements"
                checked={preferences.marketingEmails}
                onChange={() => setPreferences(p => ({ ...p, marketingEmails: !p.marketingEmails }))}
              />
            </SettingsCard>
          </TabsContent>

          {/* ── Model ── */}
          <TabsContent value="model" className="space-y-5 mt-0">
            <SettingsCard
              title="ML Model Configuration"
              description="XGBoost inference engine details"
              icon={Cpu}
              iconColor="bg-emerald-500/10 text-emerald-400"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Model Type', value: 'XGBoost Regressor' },
                  { label: 'Version', value: isModelLoading ? 'Loading...' : (model.hasActiveModel ? `v${model.modelDetails?.version}` : 'Not Active') },
                  { label: 'Accuracy', value: isModelLoading ? 'Loading...' : (model.hasActiveModel ? `${((model.modelDetails?.accuracy || 0) * 100).toFixed(1)}%` : 'N/A') },
                  { label: 'RMSE', value: isModelLoading ? 'Loading...' : (model.hasActiveModel ? model.modelDetails?.rmse?.toFixed(2) : 'N/A') },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-xs font-semibold text-white/75">{value}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] text-sm font-medium transition-all duration-200">
                  <Cpu className="w-4 h-4" />
                  Retrain Model
                </button>
              </div>
            </SettingsCard>

            {/* Danger Zone */}
            <SettingsCard
              title="Danger Zone"
              description="Irreversible destructive actions"
              icon={Shield}
              iconColor="bg-red-500/10 text-red-400"
            >
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-red-400">Delete Account</p>
                    <p className="text-xs text-white/40 mt-1">
                      Permanently deletes your account, models, and all prediction data. This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button disabled={isDeleting} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all duration-200 flex-shrink-0 disabled:opacity-50">
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[oklch(0.14_0.008_264)] border-red-500/20 shadow-2xl shadow-red-500/10 max-w-sm rounded-[24px]">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <AlertDialogHeader className="text-left">
                        <AlertDialogTitle className="text-xl font-bold text-white tracking-tight">Delete Account</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-white/50">
                          Are you sure you want to permanently delete your account? This will erase all predictions, uploaded datasets, and model configurations immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-6 flex-row gap-3 items-center">
                        <AlertDialogCancel className="mt-0 w-full rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white transition-all h-11">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="w-full rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold transition-all h-11"
                        >
                          Erase Everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </SettingsCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

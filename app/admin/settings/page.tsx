'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Save, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ContactSettingsForm = {
  publicEmail: string;
  publicPhone: string;
  publicWhatsApp: string;
  advertisementEmail: string;
  advertisementPhone: string;
  advertisementWhatsApp: string;
};

const emptyForm: ContactSettingsForm = {
  publicEmail: '',
  publicPhone: '',
  publicWhatsApp: '',
  advertisementEmail: '',
  advertisementPhone: '',
  advertisementWhatsApp: '',
};

const fieldConfig = [
  { key: 'publicEmail', label: 'Public Email', type: 'email' as const, placeholder: 'contact@example.com' },
  { key: 'publicPhone', label: 'Public Phone', type: 'text' as const, placeholder: '+91 98765 43210' },
  { key: 'publicWhatsApp', label: 'Public WhatsApp', type: 'text' as const, placeholder: '919876543210' },
  { key: 'advertisementEmail', label: 'Advertisement Email', type: 'email' as const, placeholder: 'ads@example.com' },
  { key: 'advertisementPhone', label: 'Advertisement Phone', type: 'text' as const, placeholder: '+91 98765 43210' },
  { key: 'advertisementWhatsApp', label: 'Advertisement WhatsApp', type: 'text' as const, placeholder: '919876543210' },
];

export default function AdminSettingsPage() {
  const [form, setForm] = useState<ContactSettingsForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const supabase = createClient();
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) {
            setError('Please log in as an admin to view these settings.');
            setLoading(false);
          }
          return;
        }

        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!isMounted) {
          return;
        }

        if (userError || !userRecord || userRecord.role !== 'admin') {
          setError('Access denied. Admin account required.');
          setLoading(false);
          return;
        }

        const { data: settings, error: settingsError } = await supabase
          .from('platform_contact_settings')
          .select('public_email, public_phone, public_whatsapp, advertisement_email, advertisement_phone, advertisement_whatsapp')
          .eq('id', 'global')
          .single();

        if (settingsError || !settings) {
          setError(settingsError?.message || 'No contact settings were found.');
          setLoading(false);
          return;
        }

        setForm({
          publicEmail: settings.public_email ?? '',
          publicPhone: settings.public_phone ?? '',
          publicWhatsApp: settings.public_whatsapp ?? '',
          advertisementEmail: settings.advertisement_email ?? '',
          advertisementPhone: settings.advertisement_phone ?? '',
          advertisementWhatsApp: settings.advertisement_whatsapp ?? '',
        });
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load contact settings.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: keyof ContactSettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    setSuccess(null);
  };

  const validateForm = (values: ContactSettingsForm) => {
    const errors: Record<string, string> = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[+]?[0-9\s().-]{7,20}$/;

    const validateField = (key: keyof ContactSettingsForm, label: string, isEmail: boolean) => {
      const value = values[key].trim();
      if (!value) {
        errors[key] = `${label} is required.`;
        return;
      }

      if (isEmail && !emailPattern.test(value)) {
        errors[key] = 'Please enter a valid email address.';
        return;
      }

      if (!isEmail && !phonePattern.test(value)) {
        errors[key] = 'Please enter a practical phone/WhatsApp format.';
      }
    };

    validateField('publicEmail', 'Public Email', true);
    validateField('publicPhone', 'Public Phone', false);
    validateField('publicWhatsApp', 'Public WhatsApp', false);
    validateField('advertisementEmail', 'Advertisement Email', true);
    validateField('advertisementPhone', 'Advertisement Phone', false);
    validateField('advertisementWhatsApp', 'Advertisement WhatsApp', false);

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('Please log in as an admin to continue.');
        setSaving(false);
        return;
      }

      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError || !userRecord || userRecord.role !== 'admin') {
        setError('Access denied. Admin account required.');
        setSaving(false);
        return;
      }

      const payload = {
        public_email: form.publicEmail.trim(),
        public_phone: form.publicPhone.trim(),
        public_whatsapp: form.publicWhatsApp.trim(),
        advertisement_email: form.advertisementEmail.trim(),
        advertisement_phone: form.advertisementPhone.trim(),
        advertisement_whatsapp: form.advertisementWhatsApp.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('platform_contact_settings')
        .update(payload)
        .eq('id', 'global');

      if (updateError) {
        setError(updateError.message || 'Unable to save contact settings.');
        setSaving(false);
        return;
      }

      setSuccess('Contact settings updated successfully.');
    } catch (err: any) {
      setError(err?.message || 'Unable to save contact settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-5xl p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-red-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Platform Settings</h1>
            <p className="text-sm text-gray-400">Manage Vantage Manage contact details for public and advertisement use.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-800 bg-gray-900/70 p-6 shadow-2xl shadow-black/20">
          <div>
            <h2 className="text-lg font-semibold text-white">Vantage Manage Contact Details</h2>
            <p className="mt-1 text-sm text-gray-400">These values are used for public-facing contact details.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fieldConfig.slice(0, 3).map((field) => (
              <label key={field.key} className="flex flex-col gap-2 text-sm text-gray-300">
                <span>{field.label}</span>
                <input
                  type={field.type}
                  value={form[field.key as keyof ContactSettingsForm]}
                  onChange={(event) => handleChange(field.key as keyof ContactSettingsForm, event.target.value)}
                  placeholder={field.placeholder}
                  className="rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-500"
                  autoComplete="off"
                />
                {validationErrors[field.key] && <span className="text-xs text-red-400">{validationErrors[field.key]}</span>}
              </label>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-lg font-semibold text-white">Advertisement Contact Details</h2>
            <p className="mt-1 text-sm text-gray-400">These values are used for advertisement-related contact prompts.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fieldConfig.slice(3).map((field) => (
              <label key={field.key} className="flex flex-col gap-2 text-sm text-gray-300">
                <span>{field.label}</span>
                <input
                  type={field.type}
                  value={form[field.key as keyof ContactSettingsForm]}
                  onChange={(event) => handleChange(field.key as keyof ContactSettingsForm, event.target.value)}
                  placeholder={field.placeholder}
                  className="rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-500"
                  autoComplete="off"
                />
                {validationErrors[field.key] && <span className="text-xs text-red-400">{validationErrors[field.key]}</span>}
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <div className="text-sm text-gray-400">
              {loading ? 'Loading existing settings…' : 'Changes are saved through the existing admin authorization flow.'}
            </div>
            <button
              type="submit"
              disabled={loading || saving}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

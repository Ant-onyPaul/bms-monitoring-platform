import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import InputField from '../InputField';
import { IconCopy, IconRefresh, IconCheck, IconLock } from '../icons';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vendorData: any) => void;
}

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let pass = '';
  // Format like X7kP-9mQa-2LxT
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 2) pass += '-';
  }
  return pass;
};

/* -----------------------------------------------------------------------------
   AddVendorModal

   The credential block is the reason this dialog exists — the password is shown
   exactly once and cannot be recovered afterwards, so it gets its own bordered
   well, a large monospace rendering, and copy/regenerate sitting directly
   against it. The warning is stated plainly rather than as a coloured banner,
   because it is a fact about the workflow, not an error.
   -------------------------------------------------------------------------- */

export default function AddVendorModal({ isOpen, onClose, onSubmit }: AddVendorModalProps) {
  const [vendorName, setVendorName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate password on open
  useEffect(() => {
    if (isOpen) {
      setPassword(generatePassword());
      setVendorName('');
      setEmail('');
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password');
    }
  };

  const handleRegenerate = () => {
    setPassword(generatePassword());
    setCopied(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onSubmit({ name: vendorName, email, password });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add vendor"
      description="Creates a vendor account and issues a one-time password."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-vendor-form"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Creating…"
            disabled={!vendorName || !email || isSubmitting}
          >
            Create vendor
          </Button>
        </>
      }
    >
      <form id="add-vendor-form" onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="vendorName"
          label="Vendor Name"
          value={vendorName}
          onChange={(e: any) => setVendorName(e.target.value)}
          required
          autocomplete="off"
        />

        <InputField
          id="vendorEmail"
          type="email"
          label="Email Address"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          required
          autocomplete="off"
        />

        {/* One-time credential */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 mb-2">
            <IconLock size={12} className="text-ink-4" />
            <span className="label-technical">Temporary password</span>
          </div>

          <div className="rounded-md border border-line-2 bg-surface-2 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <code className="flex-1 min-w-0 data-technical text-[17px] font-semibold text-ink tracking-[0.02em] select-all truncate">
                {password}
              </code>
              <Button
                size="sm"
                variant={copied ? 'primary' : 'secondary'}
                icon={copied ? IconCheck : IconCopy}
                onClick={handleCopy}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-line bg-surface">
              <p className="text-[11.5px] text-ink-3 leading-snug">
                Shown once. Share it securely — it cannot be retrieved later.
              </p>
              <button
                type="button"
                onClick={handleRegenerate}
                className="shrink-0 inline-flex items-center gap-1.5 text-[11.5px] font-medium
                  text-ink-3 hover:text-brand-ink cursor-pointer transition-colors
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded"
              >
                <IconRefresh size={12} />
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

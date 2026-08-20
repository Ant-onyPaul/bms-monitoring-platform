import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCopy, FiRefreshCw, FiCheck } from 'react-icons/fi';
import InputField from '../InputField';
import PrimaryButton from '../PrimaryButton';

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

export default function AddVendorModal({ isOpen, onClose, onSubmit }: AddVendorModalProps) {
  const [vendorName, setVendorName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-generate password on open
  useEffect(() => {
    if (isOpen) {
      setPassword(generatePassword());
      setVendorName('');
      setEmail('');
      setCopied(false);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Solid dark overlay instead of transparent glass to focus attention */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Box */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-slide-up-fade overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30">
          <h2 id="modal-title" className="text-xl font-bold text-foreground tracking-tight">
            Add Vendor
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 cursor-pointer"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="add-vendor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
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

          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground mb-1">
              Temporary Password
            </label>
            <div className="p-4 bg-muted/50 border border-border rounded-md">
              <div className="flex items-center justify-between mb-3">
                <code className="text-lg font-mono font-bold text-foreground tracking-wider select-all">
                  {password}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 cursor-pointer ${
                    copied 
                      ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' 
                      : 'bg-card text-foreground border border-border hover:bg-muted hover:border-muted-foreground/30'
                  }`}
                >
                  {copied ? (
                    <>
                      <FiCheck className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  Securely share this.
                </p>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#10B981] hover:text-[#10B981]/80 transition-colors focus:outline-none focus:underline cursor-pointer"
                >
                  <FiRefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-foreground bg-card border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <PrimaryButton 
            type="submit" 
            form="add-vendor-form"
            isLoading={isSubmitting}
            disabled={!vendorName || !email || isSubmitting}
            className="!w-auto px-6 !py-2 text-sm rounded-md shadow-sm"
          >
            Create Vendor
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

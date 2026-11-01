import React, { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Select, { SelectOption } from './ui/Select';
import InputField from './InputField';
import { IssuedCredentials } from '../types/database.types';
import { IconCopy, IconCheck, IconLock } from './icons';

/* -----------------------------------------------------------------------------
   OnboardModal

   One dialog for creating vendors, customers and devices. The server owns the
   temporary password: it is generated on create, returned exactly once, and
   shown here in its own bordered well so it is copied before the dialog closes.
   -------------------------------------------------------------------------- */

export interface OnboardField {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  inputMode?: 'numeric' | 'text' | 'email';
  maxLength?: number;
}

interface OnboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  submitLabel: string;
  fields: OnboardField[];
  /** Owner picker, e.g. the vendor a customer belongs to — for an admin choosing freely. */
  parent?: { label: string; options: SelectOption[]; emptyHint: string };
  /** Owner already decided by where the dialog was opened from; shown, not editable. */
  owner?: { label: string; name: string; meta?: string };
  /** Returns the issued login, or null when the entity has no login (devices). */
  onCreate: (values: Record<string, string>, parentId: string | null) => Promise<IssuedCredentials | null>;
}

export default function OnboardModal({
  isOpen,
  onClose,
  title,
  description,
  submitLabel,
  fields,
  parent,
  owner,
  onCreate,
}: OnboardModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [parentOption, setParentOption] = useState<SelectOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<IssuedCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues({});
      setError(null);
      setCredentials(null);
      setCopied(false);
      setParentOption(parent?.options[0] ?? null);
    }
    // Reset only when the dialog opens; options arriving later are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !parentOption && parent?.options.length) setParentOption(parent.options[0]);
  }, [isOpen, parent, parentOption]);

  const missingRequired = fields.some((f) => f.required && !values[f.id]?.trim());
  const missingParent = !!parent && !parentOption;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const issued = await onCreate(values, parentOption?.id ?? null);
      if (issued) setCredentials(issued);
      else onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(`${credentials.email}\n${credentials.temporary_password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copy failed — select the password and copy it manually.');
    }
  };

  if (credentials) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Account created"
        description={
          credentials.email_sent
            ? `These sign-in details were emailed to ${credentials.email}. The password is shown here only once.`
            : 'Email is not configured, so share these sign-in details securely. The password is shown only once.'
        }
        footer={
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        }
      >
        <div className="flex items-center gap-1.5 mb-2">
          <IconLock size={12} className="text-ink-4" />
          <span className="label-technical">One-time sign-in</span>
        </div>
        <div className="rounded-md border border-line-2 bg-surface-2 overflow-hidden">
          <div className="px-4 pt-3.5 pb-1 text-[12.5px] text-ink-3 data-technical truncate">{credentials.email}</div>
          <div className="flex items-center gap-3 px-4 pb-3.5">
            <code className="flex-1 min-w-0 data-technical text-[17px] font-semibold text-ink tracking-[0.02em] select-all truncate">
              {credentials.temporary_password}
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
          <p className="px-4 py-2.5 border-t border-line bg-surface text-[11.5px] text-ink-3 leading-snug">
            They will be asked to choose their own password at first sign-in. It cannot be retrieved later.
          </p>
        </div>
        {error && <p role="alert" className="mt-3 text-[12.5px] text-crit-ink">{error}</p>}
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="onboard-form"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Saving…"
            disabled={missingRequired || missingParent || isSubmitting}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="onboard-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="text-[13px] text-crit-ink">
            {error}
          </p>
        )}
        {owner && (
          <div className="h-14 flex items-center gap-3 px-3.5 rounded-[10px] bg-surface-2 border border-line">
            <IconLock size={14} className="text-ink-4 shrink-0" />
            <span className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-[0.09em] font-semibold text-ink-3">{owner.label}</span>
              <span className="mt-0.5 text-[14px] text-ink truncate">
                {owner.name}
                {owner.meta && <span className="ml-2 data-technical text-[11px] text-ink-4">{owner.meta}</span>}
              </span>
            </span>
          </div>
        )}
        {parent &&
          (parentOption ? (
            <Select
              variant="field"
              label={parent.label}
              options={parent.options}
              value={parentOption}
              onChange={setParentOption}
            />
          ) : (
            <p className="text-[13px] text-ink-3">{parent.emptyHint}</p>
          ))}
        {fields.map((f) => (
          <InputField
            key={f.id}
            id={`onboard-${f.id}`}
            type={f.type ?? 'text'}
            label={f.label}
            value={values[f.id] ?? ''}
            onChange={(e: any) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
            required={f.required}
            inputMode={f.inputMode}
            maxLength={f.maxLength}
            autocomplete="off"
          />
        ))}
      </form>
    </Modal>
  );
}

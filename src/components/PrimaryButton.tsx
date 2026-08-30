import Button, { ButtonProps } from './ui/Button';

/**
 * PrimaryButton
 *
 * Kept as a named entry point for the app's single accent action, now backed by
 * the shared Button primitive. Defaults to full width because both of its call
 * sites (login, create-vendor) are form submits; pass `fullWidth={false}` for
 * inline use.
 */
export default function PrimaryButton({
  children,
  type = 'submit',
  isLoading = false,
  disabled = false,
  className = '',
  fullWidth = true,
  size = 'lg',
  ...props
}: ButtonProps) {
  return (
    <Button
      type={type}
      variant="primary"
      size={size}
      isLoading={isLoading}
      disabled={disabled}
      fullWidth={fullWidth}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

import React from 'react';

/**
 * Unified form field wrapper to standardize spacing, label styles, and error rendering.
 * Usage:
 * <FormField label="Project Name" required error={errors.project} helper="Displayed to client">
 *   <FormInput ... />
 * </FormField>
 */
export const FormField = ({
  label,
  required = false,
  helper,
  error,
  children,
  theme,
  id,
}) => {
  const describedByIds = [];
  if (helper) describedByIds.push(`${id}-helper`);
  if (error) describedByIds.push(`${id}-error`);
  return (
    <div className="mb-4 last:mb-0">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold mb-1 px-1"
          style={{ color: theme.colors.textSecondary }}
        >
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      {React.isValidElement(children)
        ? React.cloneElement(children, { id, 'aria-describedby': describedByIds.join(' ') || undefined, 'aria-invalid': !!error || undefined })
        : children}
      {helper && !error && (
        <p id={`${id}-helper`} className="mt-1 text-[11px]" style={{ color: theme.colors.textSecondary }}>{helper}</p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[11px] font-medium" style={{ color: '#dc2626' }}>{error}</p>
      )}
    </div>
  );
};
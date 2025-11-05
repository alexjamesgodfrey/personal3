'use client';
import { Label } from '@alexgodfrey/ui/components/ui/label';
import { cn } from '@alexgodfrey/ui/lib/utils';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

// Use any types to avoid complex generics - TanStack Form has very complex type signatures
type FormInstance = any;
type FieldInstance = any;

// Form Context to share the form instance
type FormContextValue = {
  form: FormInstance;
};

const FormContext = React.createContext<FormContextValue | null>(null);

// Form Provider Component
export function Form({
  form,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'form'> & {
  form: FormInstance;
  children: React.ReactNode;
}) {
  return (
    <FormContext.Provider value={{ form }}>
      <form {...props}>{children}</form>
    </FormContext.Provider>
  );
}

// Field Context
type FormFieldContextValue = {
  name: string;
  field: FieldInstance;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

// FormField Component
interface FormFieldProps {
  name: string;
  children: (field: FieldInstance) => React.ReactNode;
  validators?: any;
  asyncDebounceMs?: number;
}

export function FormField({ name, children, validators, asyncDebounceMs }: FormFieldProps) {
  const context = React.useContext(FormContext);

  if (!context) {
    throw new Error('FormField must be used within a Form component');
  }

  const { form } = context;

  return (
    <form.Field name={name} validators={validators} asyncDebounceMs={asyncDebounceMs}>
      {(field: FieldInstance) => (
        <FormFieldContext.Provider value={{ name, field }}>
          {children(field)}
        </FormFieldContext.Provider>
      )}
    </form.Field>
  );
}

// Hook to access form field
export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { field, name } = fieldContext;
  const { id } = itemContext || { id: '' };

  // Use React.useId as fallback if no context
  const fallbackId = React.useId();
  const finalId = id || fallbackId;

  // Get error from field state
  const errors = field?.state?.meta?.errors || [];
  const error =
    errors.length > 0 ? { message: errors.map((error: any) => error.message).join(', ') } : null;

  return {
    id: finalId,
    name,
    formItemId: `${finalId}-form-item`,
    formDescriptionId: `${finalId}-form-item-description`,
    formMessageId: `${finalId}-form-item-message`,
    error,
    invalid: errors.length > 0,
    isDirty: field?.state?.meta?.isDirty || false,
    isTouched: field?.state?.meta?.isTouched || false,
    field,
  };
};

// FormItem Context and Component
type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

export function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn('grid gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

// FormLabel Component
export function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();
  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

// FormControl Component - wraps input elements
export function FormControl({ children, ...props }: React.ComponentPropsWithoutRef<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId, field } = useFormField();

  // Clone the child element and inject field props
  const child = React.Children.only(children) as React.ReactElement;

  // Create props object for the input
  const inputProps = {
    id: formItemId,
    value: field?.state?.value || '',
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      const value =
        e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
      field?.handleChange?.(value);
    },
    onBlur: () => field?.handleBlur?.(),
    'aria-describedby': !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`,
    'aria-invalid': !!error,
  };

  return (
    <Slot data-slot="form-control" {...inputProps} {...props}>
      {child}
    </Slot>
  );
}

// FormDescription Component
export function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

// FormMessage Component
export function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-destructive text-sm', className)}
      {...props}
    >
      {body}
    </p>
  );
}

// Export a hook for accessing form context
export function useFormContext() {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context.form;
}

import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({
  className,
  type,
  value,
  ...props
}: React.ComponentProps<'input'>) {
  // Only set `value` when a `value` prop was explicitly provided by the caller.
  // This avoids turning uncontrolled inputs into controlled (and potentially
  // read-only) fields when callers don't intend to control the input.
  const resolvedValue =
    type === 'file'
      ? undefined
      : value === undefined
        ? undefined
        : (value ?? '');

  return (
    // eslint-disable-next-line jsx-a11y/no-autofocus
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
      {...(resolvedValue !== undefined ? { value: resolvedValue } : {})}
    />
  );
}

export { Input };

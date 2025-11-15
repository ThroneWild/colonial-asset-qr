import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onInvalid, onInput, ...props }, ref) => {
    const handleInvalid = (event: React.FormEvent<HTMLTextAreaElement>) => {
      if (props.required) {
        event.currentTarget.setCustomValidity(
          props['data-required-message'] ?? 'Preencha este campo.',
        );
      }
      onInvalid?.(event);
    };

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      event.currentTarget.setCustomValidity('');
      onInput?.(event);
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onInvalid={handleInvalid}
        onInput={handleInput}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

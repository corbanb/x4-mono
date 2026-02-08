import React, { type ComponentPropsWithoutRef, forwardRef } from "react";

export type InputProps = ComponentPropsWithoutRef<"input"> & {
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, ...props }, ref) => (
    <div>
      <input ref={ref} aria-invalid={!!error} {...props} />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
);

Input.displayName = "Input";

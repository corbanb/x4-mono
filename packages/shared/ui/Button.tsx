import React, { type ComponentPropsWithoutRef, forwardRef } from "react";

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  isLoading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ isLoading, disabled, children, ...props }, ref) => (
    <button ref={ref} disabled={disabled || isLoading} {...props}>
      {isLoading ? "Loading\u2026" : children}
    </button>
  ),
);

Button.displayName = "Button";

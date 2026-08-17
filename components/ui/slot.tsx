import * as React from "react";

/**
 * Minimal stand-in for @radix-ui/react-slot's <Slot>: merges the props it
 * receives onto its single child instead of rendering a wrapper element.
 * Used by components that support `asChild` (e.g. Button rendered as a Link).
 */
export const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, ...props }, ref) => {
    if (!React.isValidElement(children)) return null;
    const child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      className: cnJoin((props as { className?: string }).className, child.props.className as string | undefined),
      ref,
    });
  }
);
Slot.displayName = "Slot";

function cnJoin(a?: string, b?: string) {
  return [a, b].filter(Boolean).join(" ");
}

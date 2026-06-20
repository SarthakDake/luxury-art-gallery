import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

type RevealVariant = "fade-in" | "slide-up" | "slide-left" | "slide-right" | "scale-in";

type RevealProps<T extends ElementType = "div"> = {
  as?: T;
  variant?: RevealVariant;
  delay?: number;
  immediate?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Reveal<T extends ElementType = "div">({
  as,
  variant = "slide-up",
  delay,
  immediate = false,
  children,
  className,
  style,
  ...props
}: RevealProps<T>) {
  const Component = as ?? "div";

  const revealStyle: CSSProperties = {
    ...(style as CSSProperties),
    ...(delay !== undefined ? { "--reveal-delay": `${delay}ms` } : {}),
  };

  return (
    <Component
      data-reveal={variant}
      {...(immediate ? { "data-reveal-immediate": true } : {})}
      className={className}
      style={revealStyle}
      {...props}
    >
      {children}
    </Component>
  );
}

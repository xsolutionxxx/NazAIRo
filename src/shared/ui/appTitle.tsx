import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@shared/lib/utils";

const titleVariants = cva("font-bold", {
  variants: {
    variant: {
      default: "text-foreground",
      accent: "text-accent",
    },
    size: {
      default: "text-2xl",
      sm: "text-xl",
      lg: "text-[32px]",
      xl: "text-[40px]",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface AppTitleProps
  extends
    React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
  text?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";
  asChild?: boolean;
}

const AppTitle = ({
  className,
  variant = "default",
  size = "default",
  text,
  as: Tag = "h2",
  asChild = false,
  ...props
}: AppTitleProps) => {
  const Comp = asChild ? Slot : Tag;

  return (
    <Comp
      data-slot="title"
      data-variant={variant}
      data-size={size}
      className={cn(titleVariants({ variant, size, className }))}
      {...props}
    >
      {text}
    </Comp>
  );
};

export { AppTitle, titleVariants };

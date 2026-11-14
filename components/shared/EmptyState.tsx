import * as React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center gap-4">
      {icon && (
        <div className="p-3.5 rounded-full bg-secondary text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="space-y-1.5 max-w-md">
        <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

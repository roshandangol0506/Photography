interface ComingSoonPageProps {
  title: string;
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">
        This module will be built in Phase 4.
      </p>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="w-full py-4 text-center border-t border-border bg-background">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          Powered by <span className="text-foreground">Deriv</span>
        </p>
        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mt-1">
          Built by <a href="https://architeq.co.za" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30">Architeq Web Agency</a>
        </p>
      </div>
    </footer>
  );
}

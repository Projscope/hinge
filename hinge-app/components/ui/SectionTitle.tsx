export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.1em] text-ink-3 font-medium mb-2.5">
      {children}
    </p>
  )
}

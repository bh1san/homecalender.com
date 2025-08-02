export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40 font-body">{children}</div>
  )
}

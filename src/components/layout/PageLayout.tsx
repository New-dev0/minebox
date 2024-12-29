interface PageLayoutProps {
  children: React.ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen md:pl-20">
      <div className="container mx-auto px-4 pt-8 md:pt-12 pb-24 md:pb-12">
        {children}
      </div>
    </div>
  )
} 
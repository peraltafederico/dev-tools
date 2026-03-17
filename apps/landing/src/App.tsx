const tools = [
  {
    name: 'Text Compare',
    description: 'Compare two blocks of text side by side with highlighted differences. Supports inline and unified diff views.',
    url: 'https://textcompare.federicoperalta.com',
    icon: '📝',
  },
  {
    name: 'JSON Prettifier',
    description: 'Format, validate, and beautify JSON with syntax highlighting. Minify or expand with one click.',
    url: 'https://jsonprettier.federicoperalta.com',
    icon: '🔧',
  },
]

function ToolCard({ name, description, url, icon }: typeof tools[number]) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all hover:bg-[var(--bg-card-hover)] hover:border-[var(--accent)] hover:-translate-y-0.5"
    >
      <div className="mb-3 text-4xl">{icon}</div>
      <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
        {name}
      </h2>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
      <div className="mt-4 text-xs font-medium text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
        Open tool →
      </div>
    </a>
  )
}

export default function App() {
  return (
    <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Dev Tools
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Free, fast, and privacy-friendly developer utilities.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard key={tool.name} {...tool} />
          ))}
        </div>

        <footer className="mt-16 text-center text-xs text-[var(--text-secondary)]">
          Built by{' '}
          <a
            href="https://github.com/peraltafederico"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Federico Peralta
          </a>
        </footer>
      </div>
    </div>
  )
}

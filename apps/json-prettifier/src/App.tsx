import { useState, useCallback, useEffect, useRef } from 'react'
import { JsonTreeView } from './components/JsonTreeView'

function App() {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [hiddenPaths, setHiddenPaths] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parseJson = useCallback((text: string) => {
    if (!text.trim()) {
      setParsed(null)
      setError(null)
      return
    }
    try {
      const obj = JSON.parse(text)
      setParsed(obj)
      setError(null)
    } catch (e) {
      setParsed(null)
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => parseJson(input), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input, parseJson])

  const togglePath = useCallback((path: string) => {
    setHiddenPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const showAll = useCallback(() => setHiddenPaths(new Set()), [])
  const hideAll = useCallback(() => {
    if (!parsed) return
    const paths = new Set<string>()
    const collect = (obj: unknown, prefix: string) => {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach((_, i) => {
            const p = prefix ? `${prefix}[${i}]` : `[${i}]`
            paths.add(p)
          })
        } else {
          Object.keys(obj as Record<string, unknown>).forEach(key => {
            const p = prefix ? `${prefix}.${key}` : key
            paths.add(p)
          })
        }
      }
    }
    collect(parsed, '')
    setHiddenPaths(paths)
  }, [parsed])

  const filterHidden = useCallback((obj: unknown, prefix: string): unknown => {
    if (obj === null || obj === undefined) return obj
    if (typeof obj !== 'object') return obj
    if (Array.isArray(obj)) {
      return obj
        .map((item, i) => {
          const p = prefix ? `${prefix}[${i}]` : `[${i}]`
          if (hiddenPaths.has(p)) return undefined
          return filterHidden(item, p)
        })
        .filter(item => item !== undefined)
    }
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      const p = prefix ? `${prefix}.${key}` : key
      if (hiddenPaths.has(p)) continue
      result[key] = filterHidden((obj as Record<string, unknown>)[key], p)
    }
    return result
  }, [hiddenPaths])

  const copyOutput = useCallback(async () => {
    if (!parsed) return
    const filtered = filterHidden(parsed, '')
    const text = JSON.stringify(filtered, null, 2)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [parsed, filterHidden])

  const formatInput = useCallback(() => {
    if (!parsed) return
    setInput(JSON.stringify(parsed, null, 2))
  }, [parsed])

  const clearInput = useCallback(() => {
    setInput('')
    setParsed(null)
    setError(null)
    setHiddenPaths(new Set())
  }, [])

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--json-bracket)' }}>{'{ '}</span>
            JSON Prettier
            <span style={{ color: 'var(--json-bracket)' }}>{' }'}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {parsed !== null && (
            <>
              <button
                onClick={showAll}
                className="px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Show All
              </button>
              <button
                onClick={hideAll}
                className="px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Hide All
              </button>
              <button
                onClick={copyOutput}
                className="px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer"
                style={{
                  backgroundColor: copied ? 'var(--success)' : 'var(--bg-tertiary)',
                  color: copied ? '#000' : 'var(--text-secondary)',
                  border: `1px solid ${copied ? 'var(--success)' : 'var(--border)'}`,
                }}
              >
                {copied ? '✓ Copied' : 'Copy Output'}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Input panel */}
        <div className="w-1/2 flex flex-col border-r" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>INPUT</span>
            <div className="flex gap-2">
              {parsed !== null && (
                <button
                  onClick={formatInput}
                  className="text-xs px-2 py-1 rounded cursor-pointer"
                  style={{ color: 'var(--accent)' }}
                >
                  Format
                </button>
              )}
              {input && (
                <button
                  onClick={clearInput}
                  className="text-xs px-2 py-1 rounded cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            className="flex-1 w-full p-4 resize-none outline-none text-sm leading-relaxed"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: error ? '2px solid var(--error)' : '2px solid transparent',
            }}
            placeholder="Paste your JSON here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          {error && (
            <div className="px-4 py-2 text-xs" style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: 'var(--error)' }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Output panel */}
        <div className="w-1/2 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>OUTPUT</span>
            {hiddenPaths.size > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {hiddenPaths.size} field{hiddenPaths.size !== 1 ? 's' : ''} hidden
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {parsed !== null ? (
              <JsonTreeView
                data={parsed}
                hiddenPaths={hiddenPaths}
                onTogglePath={togglePath}
              />
            ) : !error && !input ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Paste JSON on the left to prettify
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

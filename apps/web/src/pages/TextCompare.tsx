import { useState, useCallback, useRef, useEffect } from 'react'
import { diffLines, diffChars } from 'diff'

interface DiffLine {
  left: { num: number; parts: { text: string; type: 'same' | 'add' | 'del' }[] } | null
  right: { num: number; parts: { text: string; type: 'same' | 'add' | 'del' }[] } | null
  type: 'same' | 'add' | 'del' | 'mod'
}

function computeSideBySideDiff(left: string, right: string): DiffLine[] {
  const lineDiffs = diffLines(left, right)
  const result: DiffLine[] = []
  let leftNum = 1
  let rightNum = 1

  let i = 0
  while (i < lineDiffs.length) {
    const change = lineDiffs[i]

    if (!change.added && !change.removed) {
      const lines = change.value.replace(/\n$/, '').split('\n')
      for (const line of lines) {
        result.push({
          left: { num: leftNum++, parts: [{ text: line, type: 'same' }] },
          right: { num: rightNum++, parts: [{ text: line, type: 'same' }] },
          type: 'same',
        })
      }
      i++
    } else if (change.removed && i + 1 < lineDiffs.length && lineDiffs[i + 1].added) {
      const removedLines = change.value.replace(/\n$/, '').split('\n')
      const addedLines = lineDiffs[i + 1].value.replace(/\n$/, '').split('\n')
      const maxLen = Math.max(removedLines.length, addedLines.length)

      for (let j = 0; j < maxLen; j++) {
        const oldLine = j < removedLines.length ? removedLines[j] : undefined
        const newLine = j < addedLines.length ? addedLines[j] : undefined

        if (oldLine !== undefined && newLine !== undefined) {
          const wordDiff = diffChars(oldLine, newLine)
          const leftParts: { text: string; type: 'same' | 'add' | 'del' }[] = []
          const rightParts: { text: string; type: 'same' | 'add' | 'del' }[] = []

          for (const wd of wordDiff) {
            if (wd.added) {
              rightParts.push({ text: wd.value, type: 'add' })
            } else if (wd.removed) {
              leftParts.push({ text: wd.value, type: 'del' })
            } else {
              leftParts.push({ text: wd.value, type: 'same' })
              rightParts.push({ text: wd.value, type: 'same' })
            }
          }

          result.push({
            left: { num: leftNum++, parts: leftParts },
            right: { num: rightNum++, parts: rightParts },
            type: 'mod',
          })
        } else if (oldLine !== undefined) {
          result.push({
            left: { num: leftNum++, parts: [{ text: oldLine, type: 'del' }] },
            right: null,
            type: 'del',
          })
        } else if (newLine !== undefined) {
          result.push({
            left: null,
            right: { num: rightNum++, parts: [{ text: newLine, type: 'add' }] },
            type: 'add',
          })
        }
      }
      i += 2
    } else if (change.removed) {
      const lines = change.value.replace(/\n$/, '').split('\n')
      for (const line of lines) {
        result.push({
          left: { num: leftNum++, parts: [{ text: line, type: 'del' }] },
          right: null,
          type: 'del',
        })
      }
      i++
    } else if (change.added) {
      const lines = change.value.replace(/\n$/, '').split('\n')
      for (const line of lines) {
        result.push({
          left: null,
          right: { num: rightNum++, parts: [{ text: line, type: 'add' }] },
          type: 'add',
        })
      }
      i++
    } else {
      i++
    }
  }

  return result
}

function DiffView({ lines }: { lines: DiffLine[] }) {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const syncing = useRef(false)

  const syncScroll = useCallback((source: 'left' | 'right') => {
    if (syncing.current) return
    syncing.current = true
    const from = source === 'left' ? leftRef.current : rightRef.current
    const to = source === 'left' ? rightRef.current : leftRef.current
    if (from && to) {
      to.scrollTop = from.scrollTop
    }
    syncing.current = false
  }, [])

  const renderParts = (parts: { text: string; type: 'same' | 'add' | 'del' }[]) => {
    return parts.map((part, i) => {
      let cls = ''
      if (part.type === 'add') cls = 'bg-[var(--color-diff-add-word)] rounded-sm'
      if (part.type === 'del') cls = 'bg-[var(--color-diff-del-word)] rounded-sm'
      return (
        <span key={i} className={cls}>
          {part.text}
        </span>
      )
    })
  }

  const getLineBg = (type: string, side: 'left' | 'right') => {
    if (type === 'mod') return side === 'left' ? 'bg-[var(--color-diff-del-bg)]' : 'bg-[var(--color-diff-add-bg)]'
    if (type === 'del') return 'bg-[var(--color-diff-del-bg)]'
    if (type === 'add') return 'bg-[var(--color-diff-add-bg)]'
    return ''
  }

  const getPrefix = (type: string, side: 'left' | 'right') => {
    if (type === 'mod') return side === 'left' ? '−' : '+'
    if (type === 'del') return '−'
    if (type === 'add') return '+'
    return ' '
  }

  const getPrefixColor = (type: string, side: 'left' | 'right') => {
    if (type === 'mod') return side === 'left' ? 'text-red-400' : 'text-green-400'
    if (type === 'del') return 'text-red-400'
    if (type === 'add') return 'text-green-400'
    return 'text-[var(--text-muted)]'
  }

  const renderSide = (side: 'left' | 'right') => (
    <div
      ref={side === 'left' ? leftRef : rightRef}
      className="flex-1 overflow-auto min-w-0"
      onScroll={() => syncScroll(side)}
    >
      <table className="w-full border-collapse text-[13px] leading-5 font-mono">
        <tbody>
          {lines.map((line, i) => {
            const data = side === 'left' ? line.left : line.right
            const bg = data ? getLineBg(line.type, side) : ''
            const prefix = data ? getPrefix(line.type, side) : ''
            const prefixColor = data ? getPrefixColor(line.type, side) : ''
            return (
              <tr key={i} className={bg}>
                <td className="w-[50px] text-right pr-2 pl-2 select-none text-[var(--color-line-num)] border-r border-[var(--border)] shrink-0">
                  {data?.num ?? ''}
                </td>
                <td className={`w-[20px] text-center select-none ${prefixColor}`}>
                  {prefix}
                </td>
                <td className="px-2 whitespace-pre-wrap break-all">
                  {data ? renderParts(data.parts) : ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="flex border border-[var(--border)] rounded-lg overflow-hidden">
      {renderSide('left')}
      <div className="w-px bg-[var(--border)]" />
      {renderSide('right')}
    </div>
  )
}

export default function TextCompare() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [diffLines, setDiffLines] = useState<DiffLine[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const runCompare = useCallback((l: string, r: string) => {
    if (!l && !r) {
      setDiffLines([])
      return
    }
    setDiffLines(computeSideBySideDiff(l, r))
  }, [])

  const handleChange = useCallback((side: 'left' | 'right', value: string) => {
    const newLeft = side === 'left' ? value : left
    const newRight = side === 'right' ? value : right
    if (side === 'left') setLeft(value)
    else setRight(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runCompare(newLeft, newRight), 300)
  }, [left, right, runCompare])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleClear = () => {
    setLeft('')
    setRight('')
    setDiffLines([])
  }

  const stats = diffLines.length > 0 ? {
    additions: diffLines.filter(l => l.type === 'add' || (l.type === 'mod' && l.right)).length,
    deletions: diffLines.filter(l => l.type === 'del' || (l.type === 'mod' && l.left)).length,
    unchanged: diffLines.filter(l => l.type === 'same').length,
  } : null

  return (
    <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Text Compare
        </h1>
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Original</label>
          <textarea
            value={left}
            onChange={(e) => handleChange('left', e.target.value)}
            placeholder="Paste original text here..."
            className="w-full h-48 p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[13px] leading-5 resize-y placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            spellCheck={false}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Modified</label>
          <textarea
            value={right}
            onChange={(e) => handleChange('right', e.target.value)}
            placeholder="Paste modified text here..."
            className="w-full h-48 p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[13px] leading-5 resize-y placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            spellCheck={false}
          />
        </div>
      </div>

      {stats && (
        <div className="flex gap-4 mb-4 text-sm">
          <span className="text-green-400">+{stats.additions} additions</span>
          <span className="text-red-400">−{stats.deletions} deletions</span>
          <span className="text-[var(--text-secondary)]">{stats.unchanged} unchanged</span>
        </div>
      )}

      {diffLines.length > 0 && <DiffView lines={diffLines} />}

      {!left && !right && (
        <div className="text-center text-[var(--text-secondary)] mt-16 text-sm">
          Paste text in both fields to see the diff. Auto-compares as you type.
        </div>
      )}
    </div>
  )
}

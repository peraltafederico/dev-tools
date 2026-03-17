import { useState, type FC } from 'react'

interface JsonTreeViewProps {
  data: unknown
  hiddenPaths: Set<string>
  onTogglePath: (path: string) => void
}

export const JsonTreeView: FC<JsonTreeViewProps> = ({ data, hiddenPaths, onTogglePath }) => {
  return (
    <pre className="text-sm leading-6">
      <JsonNode value={data} path="" depth={0} hiddenPaths={hiddenPaths} onTogglePath={onTogglePath} />
    </pre>
  )
}

interface JsonNodeProps {
  value: unknown
  path: string
  depth: number
  hiddenPaths: Set<string>
  onTogglePath: (path: string) => void
  isLast?: boolean
  keyName?: string
}

const JsonNode: FC<JsonNodeProps> = ({ value, path, depth, hiddenPaths, onTogglePath, isLast = true, keyName }) => {
  const indent = '  '.repeat(depth)
  const childIndent = '  '.repeat(depth + 1)
  const comma = isLast ? '' : ','

  if (value === null) {
    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span style={{ color: 'var(--json-null)' }}>null</span>
        {comma}
        {'\n'}
      </span>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span style={{ color: 'var(--json-boolean)' }}>{String(value)}</span>
        {comma}
        {'\n'}
      </span>
    )
  }

  if (typeof value === 'number') {
    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span style={{ color: 'var(--json-number)' }}>{String(value)}</span>
        {comma}
        {'\n'}
      </span>
    )
  }

  if (typeof value === 'string') {
    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span style={{ color: 'var(--json-string)' }}>"{escapeString(value)}"</span>
        {comma}
        {'\n'}
      </span>
    )
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span>
          {keyName !== undefined && <KeyLabel name={keyName} />}
          <span style={{ color: 'var(--json-bracket)' }}>[]</span>
          {comma}
          {'\n'}
        </span>
      )
    }

    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span style={{ color: 'var(--json-bracket)' }}>{'['}</span>
        {'\n'}
        {value.map((item, i) => {
          const itemPath = path ? `${path}[${i}]` : `[${i}]`
          const isHidden = hiddenPaths.has(itemPath)
          return (
            <span key={itemPath}>
              {childIndent}
              <ToggleButton isHidden={isHidden} onClick={() => onTogglePath(itemPath)} />
              {isHidden ? (
                <span>
                  <span style={{ color: 'var(--text-muted)' }}>// [{i}] hidden</span>
                  {i < value.length - 1 ? ',' : ''}
                  {'\n'}
                </span>
              ) : (
                <JsonNode
                  value={item}
                  path={itemPath}
                  depth={depth + 1}
                  hiddenPaths={hiddenPaths}
                  onTogglePath={onTogglePath}
                  isLast={i === value.length - 1}
                />
              )}
            </span>
          )
        })}
        {indent}
        <span style={{ color: 'var(--json-bracket)' }}>{']'}</span>
        {comma}
        {'\n'}
      </span>
    )
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>)
    if (keys.length === 0) {
      return (
        <span>
          {keyName !== undefined && <KeyLabel name={keyName} />}
          <span style={{ color: 'var(--json-bracket)' }}>{'{}'}</span>
          {comma}
          {'\n'}
        </span>
      )
    }

    return (
      <span>
        {keyName !== undefined && <KeyLabel name={keyName} />}
        <span style={{ color: 'var(--json-bracket)' }}>{'{'}</span>
        {'\n'}
        {keys.map((key, i) => {
          const childPath = path ? `${path}.${key}` : key
          const isHidden = hiddenPaths.has(childPath)
          const childValue = (value as Record<string, unknown>)[key]
          return (
            <span key={childPath}>
              {childIndent}
              <ToggleButton isHidden={isHidden} onClick={() => onTogglePath(childPath)} />
              {isHidden ? (
                <span>
                  <span style={{ color: 'var(--json-key)' }}>"{key}"</span>
                  <span style={{ color: 'var(--text-primary)' }}>: </span>
                  <span style={{ color: 'var(--text-muted)' }}>...</span>
                  {i < keys.length - 1 ? ',' : ''}
                  {'\n'}
                </span>
              ) : (
                <JsonNode
                  value={childValue}
                  path={childPath}
                  depth={depth + 1}
                  hiddenPaths={hiddenPaths}
                  onTogglePath={onTogglePath}
                  isLast={i === keys.length - 1}
                  keyName={key}
                />
              )}
            </span>
          )
        })}
        {indent}
        <span style={{ color: 'var(--json-bracket)' }}>{'}'}</span>
        {comma}
        {'\n'}
      </span>
    )
  }

  return <span>{String(value)}{'\n'}</span>
}

const KeyLabel: FC<{ name: string }> = ({ name }) => (
  <span>
    <span style={{ color: 'var(--json-key)' }}>"{name}"</span>
    <span style={{ color: 'var(--text-primary)' }}>: </span>
  </span>
)

const ToggleButton: FC<{ isHidden: boolean; onClick: () => void }> = ({ isHidden, onClick }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        width: '1.5em',
        textAlign: 'center',
        opacity: hovered || isHidden ? 1 : 0.2,
        transition: 'opacity 0.15s',
        userSelect: 'none',
        fontSize: '0.75em',
        marginRight: '0.25em',
      }}
      title={isHidden ? 'Show field' : 'Hide field'}
    >
      {isHidden ? '👁' : '◉'}
    </span>
  )
}

function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

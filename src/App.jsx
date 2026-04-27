import { useState, useRef } from 'react'

const QUICK_PROMPTS = [
  { label: 'Login page', prompt: 'Login page with email and password fields, remember me checkbox, forgot password link, and sign in button' },
  { label: 'Profile page', prompt: 'User profile page with avatar, name, bio, stats cards for posts/followers/following, and edit profile button' },
  { label: 'Dashboard', prompt: 'Admin dashboard with collapsible sidebar, top nav, 4 stats cards, revenue chart area, and recent orders table' },
  { label: 'Product listing', prompt: 'Product listing page with search bar, category filter chips, sort dropdown, and responsive product card grid with ratings' },
  { label: 'Settings', prompt: 'Settings page with tabs for Account, Notifications, Security, and Billing sections' },
  { label: 'Pricing page', prompt: 'Pricing page with Free, Pro, and Enterprise plan cards, feature list, and CTA buttons' },
  { label: 'File upload', prompt: 'File upload component with drag-and-drop zone, file type icons, file list with size, and remove button' },
  { label: 'Kanban board', prompt: 'Kanban board with Todo, In Progress, Review, and Done columns with draggable task cards showing priority badges' },
  { label: 'Chat UI', prompt: 'Chat interface with message list, sender avatars, timestamps, and message input with send button' },
  { label: 'Register form', prompt: 'Registration form with first name, last name, email, password, confirm password, role dropdown, and terms checkbox' },
]

const PAGE_TYPES = ['Full page', 'Component', 'Dashboard', 'Form', 'Landing page', 'Modal', 'Data table', 'Card list']
const STYLES = [
  'Modern clean Tailwind CSS',
  'Minimal with lots of whitespace',
  'shadcn/ui components',
  'Dark theme',
  'Material design',
  'Colorful and bold',
]

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button onClick={copy} style={styles.copyBtn}>
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  )
}

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic_key') || '')
  const [keySet, setKeySet] = useState(!!localStorage.getItem('anthropic_key'))
  const [prompt, setPrompt] = useState('')
  const [pageType, setPageType] = useState('Full page')
  const [style, setStyle] = useState('Modern clean Tailwind CSS')
  const [filename, setFilename] = useState('MyPage.jsx')
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [tab, setTab] = useState('generate')
  const promptRef = useRef()

  const saveKey = () => {
    localStorage.setItem('anthropic_key', apiKey)
    setKeySet(true)
  }

  const clearKey = () => {
    localStorage.removeItem('anthropic_key')
    setApiKey('')
    setKeySet(false)
  }

  const generate = async () => {
    if (!prompt.trim()) { promptRef.current?.focus(); return }
    if (!apiKey) { setError('Please enter your Anthropic API key first.'); return }

    setLoading(true)
    setError('')
    setCode('')

    const systemPrompt = `You are an expert React developer. Generate a complete production-ready .jsx file.
Style: ${style}
Page type: ${pageType}
Requirements:
- Functional component with React hooks
- Realistic placeholder/mock data included
- Accessibility attributes (aria-label, role, tabIndex)
- Default export
- ONLY output raw JSX code. No markdown fences, no explanation. Start with import statements.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: `Create a ${pageType}: ${prompt}` }],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `HTTP ${res.status} — check your API key`)
      }

      const data = await res.json()
      const raw = data.content?.map(b => b.text || '').join('') || ''
      const cleaned = raw.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim()

      if (!cleaned) throw new Error('Empty response received')

      setCode(cleaned)
      setHistory(h => [{ prompt, filename, code: cleaned, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...h].slice(0, 20))
    } catch (e) {
      setError(e.message)
    }

    setLoading(false)
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚛</span>
            <div>
              <div style={styles.logoTitle}>React Frontend Agent</div>
              <div style={styles.logoSub}>Generate production JSX with AI</div>
            </div>
          </div>
          {keySet && (
            <button onClick={clearKey} style={styles.clearKeyBtn}>
              🔑 API Key set — click to change
            </button>
          )}
        </div>
      </header>

      <main style={styles.main}>
        {/* API Key setup */}
        {!keySet && (
          <div style={styles.keyBox}>
            <div style={styles.keyTitle}>🔑 Enter your Anthropic API Key</div>
            <div style={styles.keySub}>
              Get your key from{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={styles.link}>
                console.anthropic.com
              </a>{' '}
              → API Keys. It is stored only in your browser.
            </div>
            <div style={styles.keyRow}>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveKey()}
                placeholder="sk-ant-..."
                style={styles.keyInput}
              />
              <button onClick={saveKey} disabled={!apiKey} style={styles.saveKeyBtn}>
                Save Key
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button onClick={() => setTab('generate')} style={{ ...styles.tab, ...(tab === 'generate' ? styles.tabActive : {}) }}>
            Generate
          </button>
          <button onClick={() => setTab('history')} style={{ ...styles.tab, ...(tab === 'history' ? styles.tabActive : {}) }}>
            History {history.length > 0 && <span style={styles.badge}>{history.length}</span>}
          </button>
        </div>

        {tab === 'generate' && (
          <div style={styles.generatePane}>
            {/* Controls row */}
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Page type</label>
                <select value={pageType} onChange={e => setPageType(e.target.value)} style={styles.select}>
                  {PAGE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Style</label>
                <select value={style} onChange={e => setStyle(e.target.value)} style={styles.select}>
                  {STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Quick prompts */}
            <div>
              <div style={styles.label}>Quick prompts</div>
              <div style={styles.chips}>
                {QUICK_PROMPTS.map(q => (
                  <button key={q.label} onClick={() => setPrompt(q.prompt)} style={styles.chip}>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt textarea */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Describe your page</label>
              <textarea
                ref={promptRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && e.ctrlKey && generate()}
                placeholder="e.g. An invoice page with company logo, client details, line items table, and print button..."
                style={styles.textarea}
                rows={4}
              />
              <div style={styles.hint}>Ctrl + Enter to generate</div>
            </div>

            {/* Filename + Generate */}
            <div style={{ ...styles.row, alignItems: 'flex-end' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>File name</label>
                <input
                  type="text"
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  style={styles.input}
                />
              </div>
              <button onClick={generate} disabled={loading || !keySet} style={styles.genBtn}>
                {loading ? 'Generating...' : 'Generate JSX ↗'}
              </button>
            </div>

            {/* Error */}
            {error && <div style={styles.errorBox}>⚠ {error}</div>}

            {/* Loading */}
            {loading && (
              <div style={styles.loadingBox}>
                <div style={styles.dots}>
                  <span style={{ ...styles.dot, animationDelay: '0s' }} />
                  <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
                  <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
                </div>
                Writing your JSX...
              </div>
            )}

            {/* Output */}
            {code && !loading && (
              <div style={styles.outputBox}>
                <div style={styles.outputHeader}>
                  <span style={styles.fname}>{filename}</span>
                  <CopyButton text={code} />
                </div>
                <pre style={styles.codeBlock}>{code}</pre>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div>
            {history.length === 0 ? (
              <div style={styles.empty}>No generations yet. Go generate something!</div>
            ) : (
              history.map((h, i) => (
                <div key={i} style={styles.histItem} onClick={() => { setPrompt(h.prompt); setFilename(h.filename); setCode(h.code); setTab('generate') }}>
                  <div>
                    <div style={styles.histFile}>{h.filename}</div>
                    <div style={styles.histPrompt}>{h.prompt.slice(0, 80)}{h.prompt.length > 80 ? '...' : ''}</div>
                  </div>
                  <div style={styles.histTime}>{h.time}</div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  root: { minHeight: '100vh', background: '#0f0f13', color: '#e8e8f0' },
  header: { background: '#16161e', borderBottom: '1px solid #2a2a3a', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 },
  headerInner: { maxWidth: 860, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: { width: 36, height: 36, background: '#5b5bd6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  logoTitle: { fontSize: 15, fontWeight: 700, color: '#fff' },
  logoSub: { fontSize: 11, color: '#666' },
  clearKeyBtn: { fontSize: 12, background: '#1e1e2e', border: '1px solid #2a2a3a', color: '#888', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  main: { maxWidth: 860, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 },
  keyBox: { background: '#16161e', border: '1px solid #5b5bd6', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 },
  keyTitle: { fontSize: 14, fontWeight: 600, color: '#fff' },
  keySub: { fontSize: 12, color: '#888', lineHeight: 1.6 },
  link: { color: '#7c7cff', textDecoration: 'none' },
  keyRow: { display: 'flex', gap: 10 },
  keyInput: { flex: 1, padding: '8px 14px', borderRadius: 8, border: '1px solid #2a2a3a', background: '#0f0f13', color: '#e8e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, outline: 'none' },
  saveKeyBtn: { background: '#5b5bd6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tabs: { display: 'flex', borderBottom: '1px solid #2a2a3a', gap: 0 },
  tab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#666', fontSize: 13, padding: '8px 18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 },
  tabActive: { color: '#7c7cff', borderBottomColor: '#7c7cff' },
  badge: { background: '#2a2a3a', color: '#888', fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 600 },
  generatePane: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 12 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  label: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 },
  select: { padding: '8px 12px', borderRadius: 8, border: '1px solid #2a2a3a', background: '#16161e', color: '#e8e8f0', fontFamily: 'Inter, sans-serif', fontSize: 13, height: 38, outline: 'none' },
  input: { padding: '8px 12px', borderRadius: 8, border: '1px solid #2a2a3a', background: '#16161e', color: '#e8e8f0', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, height: 38, outline: 'none' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: { fontSize: 11, padding: '4px 12px', borderRadius: 20, border: '1px solid #2a2a3a', color: '#aaa', cursor: 'pointer', background: '#16161e', fontFamily: 'Inter, sans-serif', transition: 'all 0.12s' },
  textarea: { padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2a3a', background: '#16161e', color: '#e8e8f0', fontFamily: 'Inter, sans-serif', fontSize: 13, resize: 'vertical', outline: 'none', lineHeight: 1.6, width: '100%' },
  hint: { fontSize: 10, color: '#444', marginTop: 2 },
  genBtn: { background: '#5b5bd6', color: '#fff', border: 'none', borderRadius: 8, padding: '0 24px', height: 38, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  errorBox: { background: '#2d1a1a', border: '1px solid #5c2a2a', color: '#ff8080', padding: '12px 16px', borderRadius: 8, fontSize: 13 },
  loadingBox: { display: 'flex', alignItems: 'center', gap: 12, color: '#666', fontSize: 13, padding: '16px 0' },
  dots: { display: 'flex', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#5b5bd6', display: 'inline-block', animation: 'dotPulse 1.2s ease-in-out infinite' },
  outputBox: { border: '1px solid #2a2a3a', borderRadius: 10, overflow: 'hidden' },
  outputHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#16161e', borderBottom: '1px solid #2a2a3a' },
  fname: { fontSize: 12, color: '#888', fontFamily: 'JetBrains Mono, monospace' },
  copyBtn: { fontSize: 11, background: '#1e1e2e', border: '1px solid #2a2a3a', color: '#888', padding: '3px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
  codeBlock: { background: '#0f0f13', padding: '16px', overflow: 'auto', maxHeight: 460, fontSize: 12, lineHeight: 1.65, color: '#c8d3f5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  empty: { textAlign: 'center', color: '#444', fontSize: 13, padding: '40px 0' },
  histItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#16161e', borderRadius: 8, cursor: 'pointer', marginBottom: 8, border: '1px solid #2a2a3a' },
  histFile: { fontSize: 13, color: '#7c7cff', fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 },
  histPrompt: { fontSize: 11, color: '#666' },
  histTime: { fontSize: 11, color: '#444', flexShrink: 0, marginLeft: 12 },
}

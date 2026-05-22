'use client'
// required for useState, useRef, and event handlers

import { useState, useRef } from 'react'

const API = 'http://localhost:8000'

export default function Home() {

  // ── State ─────────────────────────────────────────────────────────────
  const [file,       setFile]       = useState<File | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [question,   setQuestion]   = useState('')
  const [answer,     setAnswer]     = useState('')
  const [uploading,  setUploading]  = useState(false)
  const [asking,     setAsking]     = useState(false)
  const [error,      setError]      = useState('')
  const [dragOver,   setDragOver]   = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Upload ────────────────────────────────────────────────────────────
  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`${API}/upload-pdf`, {
        method: 'POST',
        body: form,
        // omit Content-Type — browser sets it with the correct multipart boundary
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      setDocumentId(data.document_id)
    } catch {
      setError('Upload failed. Is the backend running at localhost:8000?')
    } finally {
      setUploading(false)
    }
  }

  // ── Ask ───────────────────────────────────────────────────────────────
  async function handleAsk() {
    if (!question.trim() || !documentId) return
    setAsking(true)
    setError('')
    setAnswer('')
    try {
      const res = await fetch(`${API}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, document_id: documentId }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      setAnswer(data.answer)
    } catch {
      setError('Failed to get an answer. Is the backend running at localhost:8000?')
    } finally {
      setAsking(false)
    }
  }

  // ── Drag & drop ───────────────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()  // required to allow drop
    setDragOver(true)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
      setDocumentId(null)
      setAnswer('')
    }
  }

  // ── Button style ──────────────────────────────────────────────────────
  function btn(disabled: boolean): React.CSSProperties {
    return {
      padding: '0.75rem 1.25rem',
      background: 'transparent',
      color: disabled ? 'var(--blue)' : 'var(--cyan)',
      border: `2px solid ${disabled ? 'var(--blue)' : 'var(--cyan)'}`,
      borderRadius: '0px',
      fontFamily: 'var(--font-pixel)',
      fontSize: '0.55rem',
      letterSpacing: '0.05em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.1s ease',
      whiteSpace: 'nowrap' as const,
      opacity: disabled ? 0.5 : 1,
      boxShadow: disabled ? 'none' : '3px 3px 0 #00e5ff',
    }
  }

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--font-terminal)',
    color: 'var(--sky)',
    fontSize: '1rem',
    letterSpacing: '0.08em',
    marginBottom: '1rem',
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      {/* scanlines — defined in globals.css */}
      <div id="scanlines" />

      <main style={{ minHeight: '100vh', padding: '2rem 1rem' }}>

        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            PDF RAG APP
          </h1>
          <p style={{
            fontFamily: 'var(--font-terminal)',
            fontSize: '1.3rem',
            color: 'var(--sky)',
          }}>
            upload a pdf · ask anything · get answers powered by ai
          </p>
        </header>

        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>

          {/* 01 — Upload */}
          <section className="widget">
            <p style={sectionLabel}>01 / UPLOAD YOUR PDF</p>

            {/* drop zone — click also opens file picker */}
            <div
              className={`drop-zone${dragOver ? ' drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const picked = e.target.files?.[0]
                  if (picked) {
                    setFile(picked)
                    setDocumentId(null)
                    setAnswer('')
                  }
                }}
              />

              {file ? (
                <p style={{
                  color: 'var(--mint)',
                  fontFamily: 'var(--font-terminal)',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                }}>
                  <span className="status-dot" />
                  {file.name}
                </p>
              ) : (
                <p style={{
                  color: 'var(--sky)',
                  fontFamily: 'var(--font-terminal)',
                  fontSize: '1.1rem',
                }}>
                  drag & drop a PDF here — or click to browse
                </p>
              )}
            </div>

            {file && !documentId && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{ ...btn(uploading), marginTop: '1rem', minWidth: '12rem', textAlign: 'center' }}
                onMouseEnter={(e) => {
                  if (uploading) return
                  e.currentTarget.style.transform = 'translate(-3px, -3px)'
                  e.currentTarget.style.boxShadow = '5px 5px 0 #00e5ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)'
                  e.currentTarget.style.boxShadow = '3px 3px 0 #00e5ff'
                }}
              >
                {uploading ? 'UPLOADING...' : 'UPLOAD & PROCESS →'}
              </button>
            )}

            {documentId && (
              <p style={{
                marginTop: '1rem',
                color: 'var(--mint)',
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}>
                <span className="status-dot" />
                ready. document id: {documentId}
              </p>
            )}
          </section>

          {/* 02 — Ask (dims until PDF is uploaded) */}
          <section
            className="widget"
            style={{
              opacity: documentId ? 1 : 0.35,
              pointerEvents: documentId ? 'auto' : 'none',
              transition: 'opacity 0.3s ease',
            }}
          >
            <p style={sectionLabel}>02 / ASK A QUESTION</p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                suppressHydrationWarning
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="what is this document about . . .?"
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  background: 'var(--mid)',
                  border: '1px solid var(--blue)',
                  borderRadius: '4px',
                  color: 'var(--white)',
                  fontFamily: 'var(--font-terminal)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e)  => (e.target.style.borderColor = 'var(--cyan)')}
                onBlur={(e)   => (e.target.style.borderColor = 'var(--blue)')}
              />
              <button
                onClick={handleAsk}
                disabled={asking || !question.trim()}
                style={{ ...btn(asking || !question.trim()), minWidth: '7rem', textAlign: 'center' }}
                onMouseEnter={(e) => {
                  if (asking || !question.trim()) return
                  e.currentTarget.style.transform = 'translate(-3px, -3px)'
                  e.currentTarget.style.boxShadow = '5px 5px 0 #00e5ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)'
                  e.currentTarget.style.boxShadow = '3px 3px 0 #00e5ff'
                }}
              >
                {asking ? 'THINKING...' : 'ASK →'}
              </button>
            </div>
          </section>

          {/* 03 — Answer */}
          {answer && (
            <section className="widget animate-glow-pulse">
              <p style={sectionLabel}>03 / ANSWER</p>
              <p style={{
                color: 'var(--white)',
                fontFamily: 'var(--font-body)',
                lineHeight: '1.9',
                fontSize: '1rem',
              }}>
                {answer}
              </p>
            </section>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              border: '1px solid var(--pink)',
              borderRadius: '4px',
              background: 'rgba(255, 110, 180, 0.05)',
            }}>
              <p style={{
                color: 'var(--pink)',
                fontFamily: 'var(--font-terminal)',
                fontSize: '1rem',
              }}>
                {error}
              </p>
            </div>
          )}

        </div>
      </main>
    </>
  )
}

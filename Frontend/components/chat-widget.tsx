"use client"

import React, { useState, useRef, useEffect } from 'react'
import styles from '../styles/chat-widget.module.css'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{from: 'me'|'bot', text: string}[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080'

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  function toggle() {
    setOpen(v => !v)
  }

  function sendMessage() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, {from: 'me', text}])
    setInput('')
    setLoading(true)

    const url = apiBase.replace(/\/$/, '') + '/api/ai/chat'

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => ({}))
          if (res.ok && data && data.response) {
            const resp = typeof data.response === 'string' ? data.response : JSON.stringify(data.response)
            setMessages(prev => [...prev, { from: 'bot', text: resp }])
          } else if (data && data.error) {
            setMessages(prev => [...prev, { from: 'bot', text: 'Lỗi: ' + data.error }])
          } else {
            setMessages(prev => [...prev, { from: 'bot', text: 'Lỗi không xác định từ server' }])
          }
        } else {
          // Non-JSON response: read text and show it
          const textBody = await res.text().catch(() => '')
          if (res.ok) {
            setMessages(prev => [...prev, { from: 'bot', text: textBody || 'Empty response' }])
          } else {
            setMessages(prev => [...prev, { from: 'bot', text: 'Lỗi từ server: ' + (textBody || res.statusText) }])
          }
        }
      })
      .catch((err) => {
        setMessages(prev => [...prev, {from: 'bot', text: 'Yêu cầu thất bại: ' + (err?.message || err)}])
      })
      .finally(() => setLoading(false))
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>){
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className={styles.container} aria-live="polite">
      <div className={styles.button} onClick={toggle} title={open ? 'Đóng chat' : 'Mở chat'}>
        {open ? '✕' : '💬'}
      </div>

      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>Chat hỗ trợ</div>
          <div className={styles.messages}>
            {messages.length === 0 && <div className={styles.empty}>Xin chào! Bạn có thể hỏi tôi về lịch khám, báo lỗi, hoặc trợ giúp khác.</div>}
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'me' ? styles.msgMe : styles.msgBot}>{m.text}</div>
            ))}
          </div>
          <div className={styles.inputRow}>
            <input ref={inputRef} className={styles.input} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} placeholder="Viết tin nhắn..." />
            <button className={styles.send} onClick={sendMessage} disabled={loading}>{loading ? '...' : 'Gửi'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

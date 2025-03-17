import React, { useState } from 'react'
import './assistantWidget.css' // wenn vorhanden

export default function AssistantWidget({ open, onClose }) {
  if (!open) return null

  const [messages, setMessages] = useState([
    { sender: 'assistant', text: 'Hallo, wie kann ich helfen?' }
  ])
  const [inputText, setInputText] = useState('')

  function sendMsg() {
    if (!inputText.trim()) return
    const userMsg = { sender: 'user', text: inputText }
    const aiMsg = { sender: 'assistant', text: 'Verstanden (Simuliert)' }
    setMessages(prev => [...prev, userMsg, aiMsg])
    setInputText('')
  }

  return (
    <div className="assistant-widget">
      <div className="assistant-header">
        <h4>KI-Assistent</h4>
        <button className="assistant-close-btn" onClick={onClose}>×</button>
      </div>
      <div className="assistant-body">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`assistant-message ${m.sender === 'user' ? 'user' : 'ai'}`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="assistant-footer">
        <input
          type="text"
          placeholder="Nachricht eingeben..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <button onClick={sendMsg}>OK</button>
      </div>
    </div>
  )
}

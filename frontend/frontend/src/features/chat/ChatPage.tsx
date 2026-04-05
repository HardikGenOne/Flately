// @ts-nocheck
import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import {
  fetchMyMatches,
  joinChatRoom,
  onChatMessage,
  openConversation,
  sendChatMessage,
} from './chat.transport'

function ChatThread({ conversation, isActive, onClick }) {
  const userImage = conversation.user?.photos?.[0] || conversation.user?.image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
  const hasUnread = conversation.unreadCount > 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 border-b border-slate-200 p-3 px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] focus-visible:ring-inset ${
        isActive ? 'bg-mint border-l-[3px] border-l-[#166534]' : 'hover:bg-slate-50'
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-lg bg-cover bg-center border border-slate-200" style={{ backgroundImage: `url('${userImage}')` }} />
        {conversation.online && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className={`text-sm truncate ${isActive ? 'font-bold text-slate-900' : hasUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
            {conversation.user?.name || 'Roommate'}
          </h3>
          <span className={`text-[10px] font-mono ${hasUnread ? 'text-[#166534] font-bold' : 'text-slate-400'}`}>{conversation.lastMessageTime || ''}</span>
        </div>
        <p className={`text-xs truncate ${hasUnread ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>{conversation.lastMessage || 'Start a conversation'}</p>
      </div>
      {hasUnread && <div className="absolute right-3 top-1/2 mt-3 w-2 h-2 bg-[#166534] rounded-full" />}
    </button>
  )
}

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex flex-col gap-1 max-w-[80%] ${isOwn ? 'items-end self-end' : 'items-start'}`}>
      <div className={`p-4 rounded-lg text-sm leading-relaxed font-medium ${
        isOwn
          ? 'bg-[#166534] border border-[#166534] text-white rounded-tr-sm'
          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm'
      }`}>
        {message.content}
      </div>
      <span className={`text-[10px] text-slate-400 font-mono ${isOwn ? 'mr-1' : 'ml-1'}`}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}

export default function ChatPage() {
  const { matchId } = useParams()
  const { user, getAccessTokenSilently } = useAuth0()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConvo, setActiveConvo] = useState(matchId || null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [refreshSeed, setRefreshSeed] = useState(0)
  const [otherUser, setOtherUser] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    async function init() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const matches = await fetchMyMatches(getAccessTokenSilently)
        if (isMounted && matches) {
          const convos = matches.map(m => ({
            id: m.id, user: m.otherUser ? { ...m.otherUser, image: m.otherUser.photos?.[0] } : { name: 'Roommate', image: null },
            lastMessage: m.lastMessage || '', lastMessageTime: m.matchedAt ? new Date(m.matchedAt).toLocaleDateString() : '', unreadCount: 0, online: false
          }))
          setConversations(convos)
          if (!activeConvo && convos.length > 0) setActiveConvo(convos[0].id)
        }
        if (activeConvo) {
          const data = await openConversation(activeConvo, getAccessTokenSilently)
          if (isMounted) {
            setConversationId(data.conversation?.id); setMessages(data.messages || []); setOtherUser(data.otherUser)
            if (data.conversation?.id) joinChatRoom(data.conversation.id)
          }
        }
        if (isMounted) setIsLoading(false)
      } catch (error) {
        console.error('Failed to load chat:', error)
        if (isMounted) {
          setErrorMessage('Unable to load conversations right now.')
          setIsLoading(false)
        }
      }
    }
    init()
    const unsubscribe = onChatMessage((msg) => setMessages((prev) => [...prev, msg]))
    return () => { isMounted = false; unsubscribe() }
  }, [activeConvo, getAccessTokenSilently, refreshSeed])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return
    const messageContent = input.trim()
    setMessages(prev => [...prev, { id: `temp-${Date.now()}`, senderId: user?.sub, content: messageContent, createdAt: new Date().toISOString() }])
    setInput('')
    sendChatMessage({ conversationId, senderId: user?.sub, content: messageContent })
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }
  const activeConversation = conversations.find(c => c.id === activeConvo) || conversations[0]
  const chatUser = otherUser || activeConversation?.user

  if (isLoading) {
    return (
      <section className="flex flex-1 p-4 md:p-6" aria-busy="true" aria-live="polite">
        <div className="flex min-h-[320px] w-full items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3" role="status">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#166534]" />
            <p className="text-xs font-mono text-slate-500">Loading conversations...</p>
          </div>
        </div>
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section className="flex flex-1 p-4 md:p-6">
        <div className="flex min-h-[320px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-6 text-center shadow-sm" role="alert">
          <p className="text-sm font-semibold text-amber-900">Could not load chat.</p>
          <p className="text-xs text-amber-800">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setRefreshSeed((seed) => seed + 1)}
            className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  if (!activeConversation) {
    return (
      <section className="flex flex-1 p-4 md:p-6">
        <div className="flex min-h-[320px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white px-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">No conversations available.</p>
          <p className="text-xs text-slate-500">Connect with a match to start messaging here.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full min-w-0 flex-1 p-4 md:p-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm md:flex-row">
      {/* Left — Threads */}
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white md:w-80 md:border-b-0 md:border-r">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-sm text-slate-400 placeholder:text-slate-400 font-medium"
              placeholder="Search coming soon"
              type="text"
              disabled
              aria-label="Search threads coming soon"
            />
          </div>
          <div className="flex gap-4">
            <span className="border-b-2 border-[#166534] pb-1 text-xs font-bold text-slate-900">All</span>
            <button type="button" disabled aria-disabled="true" className="cursor-not-allowed pb-1 text-xs font-medium text-slate-400" title="Unread filter coming soon">Unread (2)</button>
            <button type="button" disabled aria-disabled="true" className="cursor-not-allowed pb-1 text-xs font-medium text-slate-400" title="Archived filter coming soon">Archived</button>
          </div>
        </div>
        <div className="max-h-[320px] flex-1 overflow-y-auto md:max-h-none">
          {conversations.length === 0 ? (
            <div className="flex h-full min-h-[120px] items-center justify-center px-4 py-6 text-center text-xs text-slate-500">
              No threads yet.
            </div>
          ) : (
            conversations.map((convo) => (
              <ChatThread key={convo.id} conversation={convo} isActive={convo.id === activeConvo} onClick={() => setActiveConvo(convo.id)} />
            ))
          )}
        </div>
      </aside>

      {/* Center — Messages */}
      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-mint">
        <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {chatUser?.name || 'Roommate'} <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </h2>
              <span className="text-xs text-slate-500 font-mono">Last active: Just now</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" disabled aria-disabled="true" className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400" title="Video call is not wired in this phase">
              <span className="material-symbols-outlined text-[18px]">videocam</span>
            </button>
            <button type="button" disabled aria-disabled="true" className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400" title="More actions are not wired in this phase">
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5" role="log" aria-live="polite" aria-relevant="additions text">
          <div className="flex justify-center my-4">
            <span className="bg-white/50 border border-slate-200/60 text-slate-500 text-[10px] font-mono font-medium px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
          </div>
          {messages.map((msg) => <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.sub} />)}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-6 bg-white border-t border-slate-200">
          <div className="flex gap-3 items-end">
            <button type="button" disabled aria-disabled="true" className="self-center cursor-not-allowed rounded-lg border border-transparent p-2.5 text-slate-300" title="Attachments are not wired in this phase">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-[#166534] focus:border-[#166534] resize-none h-[48px] min-h-[48px] max-h-[120px] shadow-sm" placeholder="Type a message..." rows="1" aria-label="Message input"
              />
            </div>
            <button
              onClick={handleSend} disabled={!input.trim()}
              className="bg-[#166534] hover:bg-[#14532d] text-white rounded-lg px-6 h-[48px] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] focus-visible:ring-offset-1"
            >
              <span className="text-sm font-bold tracking-wide">Send</span>
            </button>
          </div>
        </div>
      </section>

      {/* Right — Match Intel */}
      <aside className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto hidden xl:flex">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-slate-400">grid_view</span> Match Intel
          </h3>
          <button type="button" disabled aria-disabled="true" className="cursor-not-allowed text-slate-300" title="Info panel actions are not wired in this phase">
            <span className="material-symbols-outlined text-[18px]">info</span>
          </button>
        </div>
        <div className="p-5 flex flex-col gap-6">
          <div className="bg-mint rounded-lg p-4 border border-[#166534]/20 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Match Score</p>
              <p className="text-3xl font-bold font-mono text-[#166534] mt-1 tracking-tight">94%</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-white border border-[#166534]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#166534] text-[24px]">verified</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ icon: 'payments', label: 'Budget', val: '$1.5k' }, { icon: 'calendar_month', label: 'Move-in', val: 'Oct 1st' },
              { icon: 'cake', label: 'Age', val: '27' }, { icon: 'work', label: 'Job', val: 'Design' }].map(s => (
              <div key={s.label} className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">{s.icon}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{s.label}</span>
                </div>
                <p className="font-mono text-sm font-bold text-slate-900">{s.val}</p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Lifestyle &amp; Habits</h4>
            <div className="flex flex-wrap gap-2">
              {['Early Bird', 'Non-Smoker', 'Vegetarian', 'Social Drinker', 'Clean Freak'].map(t => (
                <span key={t} className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Private Notes</h4>
            <textarea className="w-full cursor-not-allowed text-xs bg-yellow-50 border border-yellow-200 text-slate-500 rounded-lg p-3 min-h-[80px] placeholder:text-yellow-700/50 font-medium" placeholder="Private notes coming soon..." disabled aria-label="Private notes coming soon" />
          </div>
          <div className="pt-2 mt-auto grid grid-cols-2 gap-3">
            <button type="button" disabled aria-disabled="true" className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 px-4 text-xs font-bold uppercase tracking-wide text-slate-400" title="Report action coming soon">
              <span className="material-symbols-outlined text-[16px]">flag</span> Report
            </button>
            <button type="button" disabled aria-disabled="true" className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 px-4 text-xs font-bold uppercase tracking-wide text-red-400" title="Unmatch action coming soon">
              <span className="material-symbols-outlined text-[16px]">block</span> Unmatch
            </button>
          </div>
        </div>
      </aside>
      </div>
    </section>
  )
}

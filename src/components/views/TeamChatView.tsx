import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTaskContext } from '../../context/TaskContext'
import { Avatar } from '../common/Avatar'
import { snappySpring } from '../../utils/motion'
import { Send, MessageSquare, Users } from 'lucide-react'

export const TeamChatView: React.FC = () => {
  const { chatMessages, sendChatMessage, users, currentUser, activeProject, activeProjectId } = useTaskContext()
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const projectMessages = chatMessages.filter((m) => m.projectId === activeProjectId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [projectMessages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    sendChatMessage(inputText)
    setInputText('')
  }

  const handleQuickReaction = (emoji: string) => {
    sendChatMessage(emoji)
  }

  return (
    <div className="h-[calc(100dvh-290px)] sm:h-[calc(100vh-140px)] min-h-[380px] flex gap-4 animate-fadeIn select-none">
      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col bg-[#0E0E14] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-[#0D0D12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                #{activeProject.code.toLowerCase()}-engineering-sync
              </h3>
              <p className="text-[11px] text-slate-400">
                Collaborative team channel for {activeProject.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {users.filter((u) => u.status === 'online').length} online
            </span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto momentum-scroll p-4 sm:p-6 space-y-4">
          {projectMessages.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-slate-300">No messages in #{activeProject.code.toLowerCase()} yet</p>
              <p className="text-[11px] text-slate-500 mt-1">Start the conversation with your team below!</p>
            </div>
          ) : (
            projectMessages.map((msg) => {
              const sender = users.find((u) => u.id === msg.senderId)
              const isMe = msg.senderId === currentUser.id

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={snappySpring}
                  className={`flex items-start gap-3 text-xs ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar user={sender} size="sm" showStatus={true} />
                  <div
                    className={`max-w-md space-y-1 ${
                      isMe ? 'items-end text-right' : 'items-start text-left'
                    }`}
                  >
                    <div className="flex items-center gap-2 px-1">
                      <span className="font-semibold text-slate-200">
                        {isMe ? 'You' : sender?.name || 'Member'}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl leading-relaxed text-xs ${
                        isMe
                          ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-purple-600/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reactions Bar */}
        <div className="px-4 sm:px-6 py-2 border-t border-slate-800/60 bg-[#0D0D12] flex items-center gap-2 text-xs overflow-x-auto momentum-scroll no-scrollbar">
          <span className="text-[10px] uppercase font-semibold text-slate-400 shrink-0">Quick React:</span>
          {['🚀 Shipped!', '🔥 Looks incredible', '👍 Approved', '🎉 Great sprint', '⚡ Boost'].map(
            (phrase) => (
              <motion.button
                key={phrase}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={snappySpring}
                onClick={() => handleQuickReaction(phrase)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors shrink-0 whitespace-nowrap min-h-[32px]"
              >
                {phrase}
              </motion.button>
            )
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-800 bg-[#0A0A0E]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message #${activeProject.code.toLowerCase()}-engineering-sync...`}
              className="w-full pl-4 pr-16 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-inner min-h-[44px]"
            />
            <div className="absolute right-1.5 flex items-center">
              <button
                type="submit"
                disabled={!inputText.trim()}
                title="Send Message"
                aria-label="Send Message"
                className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 text-white transition-all shadow shadow-purple-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Online Members Sidebar */}
      <div className="hidden lg:flex w-64 flex-col bg-[#0E0E14] border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
          <Users className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-bold text-slate-100">Project Members ({users.length})</h4>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/40 transition-colors"
            >
              <Avatar user={u} size="sm" showStatus={true} />
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-semibold text-slate-200 truncate">{u.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{u.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-[#0D0D12] border border-slate-800 text-[11px] text-slate-400 text-center">
          Instant messaging synced via client state
        </div>
      </div>
    </div>
  )
}

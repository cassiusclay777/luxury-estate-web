'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, X, Sparkles, Home, TrendingUp } from 'lucide-react'
import { chatWithAIStream, ChatMessage, PropertyRecommendation } from '../../services/groqai'
import { Property } from '../../lib/supabase'
import Link from 'next/link'

interface AIChatProps {
  properties?: Property[]
  initialOpen?: boolean
}

export function AIChat({ properties = [], initialOpen = false }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Ahoj! Jsem LuxEstate AI Assistant. Jak vám mohu pomoci s hledáním nemovitosti?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<PropertyRecommendation[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Example questions
  const exampleQuestions = [
    'Najdi byt v Brně do 5 milionů',
    'Jaké jsou aktuální trendy na realitním trhu?',
    'Co potřebuji k hypotéce?',
    'Doporuč vily s bazénem'
  ]

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    // Add empty assistant message for streaming
    const streamingMessage: ChatMessage = {
      role: 'assistant',
      content: ''
    }
    setMessages([...newMessages, streamingMessage])

    try {
      let streamedContent = ''

      const result = await chatWithAIStream(
        newMessages,
        properties,
        (chunk) => {
          // Update message with each chunk in real-time
          streamedContent += chunk
          setMessages([...newMessages, { role: 'assistant', content: streamedContent }])
        }
      )

      // Set final message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.response
      }

      setMessages([...newMessages, assistantMessage])

      if (result.recommendations) {
        setRecommendations(result.recommendations)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Omlouvám se, došlo k chybě. Zkuste to prosím znovu.'
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <>
      {/* Chat toggle button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm">AI Assistant</p>
            <p className="text-xs opacity-80">Dotaz zdarma</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </motion.button>
      )}

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] flex flex-col bg-gradient-to-b from-navy/95 to-navy/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white">LuxEstate AI</h3>
                  <p className="text-sm text-white/60">Realitní expert</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white'
                        : 'bg-white/10 text-white backdrop-blur-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-white/20" />
                      )}
                      <span className="text-xs font-medium opacity-70">
                        {message.role === 'assistant' ? 'LuxEstate AI' : 'Vy'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-bold text-white">Doporučené nemovitosti</h4>
                  </div>
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <Link
                        key={rec.id}
                        href={`/properties/${rec.id}`}
                        className="block glass rounded-xl p-4 hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {rec.title}
                            </h5>
                            <p className="text-sm text-white/60">{rec.address}, {rec.city}</p>
                          </div>
                          <div className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg">
                            <span className="text-xs font-bold text-cyan-300">
                              {rec.matchScore}% shoda
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-white">
                            {formatPrice(rec.price)}
                          </span>
                          <span className="text-sm text-white/70">{rec.reasoning}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Example questions */}
              {messages.length <= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  <p className="text-sm text-white/60 mb-3">Zkuste se zeptat:</p>
                  <div className="flex flex-wrap gap-2">
                    {exampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(question)}
                      className="px-3 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors"
                      title={`Zeptat se: ${question}`}
                      aria-label={`Zeptat se: ${question}`}
                    >
                      {question}
                    </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-white/10 text-white backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200" />
                      </div>
                      <span className="text-sm">AI přemýšlí...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Napište svůj dotaz..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all duration-300 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Odeslat</span>
                </button>
              </div>
              <p className="text-xs text-white/40 mt-2 text-center">
                AI může občas dělat chyby. Ověřte si informace.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiMoreVertical, FiSend, FiImage, FiSmile, FiPaperclip, FiMic, FiX } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import PageTransition from '../../components/shared/PageTransition'
import { AnimatedBackground } from '../../components/backgrounds'
import MessagesList from '../../components/messages/MessagesList'
import BottomSheet from '../../components/shared/BottomSheet'
import { format } from 'date-fns'

import GifSelector from '../../components/messages/GifSelector'
import MainNav from '../../components/navigation/MainNav'
import { colorSchemes, ColorScheme } from '../../utils/colorSchemes'
import {  BackgroundType } from '../../types'
import { Pattern, patterns } from '../../utils/patterns'
import { 
  ParticlesBackground, 
  WavesBackground 
} from '../../components/backgrounds'
import WarScene from '../../components/scenes/WarScene'

interface Participant {
  id: string
  username: string
  avatar_url: string | null
  online?: boolean
  last_seen?: string
}

interface Message {
  id: string
  sender_id: string
  content: string
  type: 'text' | 'gif' | 'image' | 'file' | 'voice'
  created_at: string
  conversation_id?: string
  is_read: boolean
  metadata?: {
    gif_id?: string
    file_name?: string
    file_size?: number
    duration?: number
  }
  reactions?: {
    user_id: string
    emoji: string
    created_at: string
  }[]
}


function formatMessageTime(timestamp: Date): string {
  return format(timestamp, 'h:mm a')
}

export default function ConversationView() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUser, setOtherUser] = useState<Participant | null>(null)
  // @ts-expect-error: //
  const [loading, setLoading] = useState(true)
  const backgroundRef = useRef(null)

  // Add back missing refs and state
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // @ts-expect-error: //
  const [conversation, setConversation] = useState<{
    id: string;
    participant_ids: string[];
    type: string;
  }>()
  const [isAttachmentSheetOpen, setIsAttachmentSheetOpen] = useState(false)
  const [showGifSelector, setShowGifSelector] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>()
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const [themeState, setThemeState] = useState({
    backgroundType: 'saturn' as BackgroundType,
    primaryColor: '#00ff88',
    pattern: null as Pattern | null,
    patternIntensity: 100,
    colorScheme: null as ColorScheme | null,
    customColors: {
      primary: '#00ff88',
      background: '#1a1a2e'
    }
  });

  useEffect(() => {
    const loadTheme = async () => {
      if (!user?.id) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme')
          .eq('id', user.id)
          .single();

        if (profile?.theme) {
          const theme = profile.theme;
          
          setThemeState(prev => ({
            ...prev,
            backgroundType: theme.background || 'saturn',
            pattern: theme.pattern ? patterns.find(p => p.id === theme.pattern) || null : null,
            patternIntensity: theme.patternIntensity || 100,
            colorScheme: theme.colorScheme ? colorSchemes.find(s => s.id === theme.colorScheme) || null : null,
            customColors: theme.customColors || prev.customColors,
            primaryColor: theme.customColors?.primary || prev.primaryColor
          }));
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, [user?.id]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId || !user) return

      try {
        // First fetch the conversation
        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single()

        if (convError) throw convError

        // Then fetch the other user's profile separately
        if (conv.participant_ids) {
          const otherUserId = conv.participant_ids.find(id => id !== user.id)
          if (otherUserId) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .eq('id', otherUserId)
              .single()

            if (userError) throw userError
            setOtherUser(userData)
          }
        }

        // Fetch messages with reactions
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            content,
            created_at,
            is_read,
            type,
            metadata,
            message_reactions (
              user_id,
              emoji,
              created_at
            )
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (msgError) throw msgError

        // Transform the data to match our Message interface
        const transformedMessages = messages?.map(msg => ({
          ...msg,
          reactions: msg.message_reactions
        })) || []

        setMessages(transformedMessages)
      } catch (error) {
        console.error('Error fetching conversation:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversation()

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: '*', // Listen to all events
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setMessages(current => [...current, { ...payload.new, reactions: [] }] as Message[])
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
        filter: `message_id=in.(${messages.map(m => m.id).join(',')})`
      }, async payload => {
        // Fetch updated reactions for the message
        const { data: updatedReactions } = await supabase
          .from('message_reactions')
          .select('*')
          // @ts-expect-error: This is a temporary fix to allow the form data to be updated
          .eq('message_id', payload.new.message_id)
        setMessages(current => 
        
          current.map(msg => 
          // @ts-expect-error: This is a temporary fix to allow the form data to be updated
          msg.id === payload.new.message_id 
              ? { ...msg, reactions: updatedReactions }
              : msg
          )
        )
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId, messages.map(m => m.id).join(',')])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [newMessage])

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      // Emit typing event to other user
    }

    if (typingTimeout) clearTimeout(typingTimeout)
    
    const timeout = setTimeout(() => {
      setIsTyping(false)
      // Emit stopped typing event
    }, 1000)
    
    setTypingTimeout(timeout)
  }

  const handleReply = (message: Message) => {
    setReplyTo(message)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user?.id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId || !user || !conversation) return

    const messageContent = newMessage.trim()
    setNewMessage('') // Clear input immediately
    setReplyTo(null)

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      conversation_id: conversationId,
      sender_id: user.id,
      content: messageContent,
      type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
      reactions: [],
      ...(replyTo && {
        reply_to: {
          id: replyTo.id,
          content: replyTo.content,
          type: replyTo.type
        }
      })
    }

    // Add optimistic message to UI
    setMessages(current => [...current, optimisticMessage])

    try {
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageContent,
        type: 'text',
        is_read: false,
        ...(replyTo && {
          reply_to: {
            id: replyTo.id,
            content: replyTo.content,
            type: replyTo.type
          }
        })
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (error) throw error

      // Replace optimistic message with real one
      if (data) {
        setMessages(current => 
          current.map(msg => 
            msg.id === optimisticMessage.id ? { ...data, reactions: [] } : msg
          )
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message on error
      setMessages(current => 
        current.filter(msg => msg.id !== optimisticMessage.id)
      )
      // Optionally show error toast/notification
    }
  }

  const handleGifSelect = async (gif: { url: string, id: string }) => {
    if (!conversationId || !user) return

    // Create optimistic GIF message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      content: gif.url.replace('media.giphy.com', 'i.giphy.com'),
      type: 'gif',
      is_read: false,
      created_at: new Date().toISOString(),
      reactions: [],
      metadata: {
        gif_id: gif.id
      },
      ...(replyTo && {
        reply_to: {
          id: replyTo.id,
          content: replyTo.content,
          type: replyTo.type
        }
      })
    }

    // Add optimistic message to UI
    setMessages(current => [...current, optimisticMessage])
    setShowGifSelector(false)
    setReplyTo(null)
    setIsAttachmentSheetOpen(false)

    try {
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: optimisticMessage.content,
        type: 'gif',
        is_read: false,
        metadata: {
          gif_id: gif.id
        },
        ...(replyTo && {
          reply_to: {
            id: replyTo.id,
            content: replyTo.content,
            type: replyTo.type
          }
        })
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (error) throw error

      // Replace optimistic message with real one
      if (data) {
        setMessages(current => 
          current.map(msg => 
            msg.id === optimisticMessage.id ? { ...data, reactions: [] } : msg
          )
        )
      }
    } catch (error) {
      console.error('Error sending GIF:', error)
      // Remove optimistic message on error
      setMessages(current => 
        current.filter(msg => msg.id !== optimisticMessage.id)
      )
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      content: URL.createObjectURL(file),
      type: 'image',
      created_at: new Date().toISOString(),
      is_read: false,
      reactions: []
    };

    setMessages(current => [...current, optimisticMessage]);
    setIsAttachmentSheetOpen(false);

    try {
      const uploadPath = `${user.id}/${conversationId}/${Date.now()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(uploadPath, file);

      if (uploadError) throw uploadError;

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: uploadData.path,
          type: 'image',
          metadata: {
            file_name: file.name,
            file_size: file.size
          }
        })
        .select()
        .single();

      if (messageError) throw messageError;

      setMessages(current => 
        current.map(msg => 
          msg.id === optimisticMessage.id ? { ...messageData, reactions: [] } : msg
        )
      );
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessages(current => 
        current.filter(msg => msg.id !== optimisticMessage.id)
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      content: file.name,
      type: 'file',
      created_at: new Date().toISOString(),
      is_read: false,
      reactions: [],
      metadata: {
        file_name: file.name,
        file_size: file.size
      }
    };

    setMessages(current => [...current, optimisticMessage]);
    setIsAttachmentSheetOpen(false);

    try {
      const uploadPath = `${user.id}/${conversationId}/${Date.now()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(uploadPath, file);

      if (uploadError) throw uploadError;

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: uploadData.path,
          type: 'file',
          metadata: {
            file_name: file.name,
            file_size: file.size
          }
        })
        .select()
        .single();

      if (messageError) throw messageError;

      setMessages(current => 
        current.map(msg => 
          msg.id === optimisticMessage.id ? { ...messageData, reactions: [] } : msg
        )
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessages(current => 
        current.filter(msg => msg.id !== optimisticMessage.id)
      );
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !conversationId) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        sender_id: user.id,
        content: URL.createObjectURL(audioBlob),
        type: 'voice',
        created_at: new Date().toISOString(),
        is_read: false,
        reactions: []
      };

      setMessages(current => [...current, optimisticMessage]);

      try {
        const uploadPath = `${user.id}/${conversationId}/${Date.now()}-${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('message-attachments')
          .upload(uploadPath, file);

        if (uploadError) throw uploadError;

        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: uploadData.path,
            type: 'voice',
            metadata: {
              duration: 0 // You might want to calculate actual duration
            }
          })
          .select()
          .single();

        if (messageError) throw messageError;

        setMessages(current => 
          current.map(msg => 
            msg.id === optimisticMessage.id ? { ...messageData, reactions: [] } : msg
          )
        );
      } catch (error) {
        console.error('Error uploading voice message:', error);
        setMessages(current => 
          current.filter(msg => msg.id !== optimisticMessage.id)
        );
      }
    };
  };

  return (
    <PageTransition>
      <div className="hidden md:block">
        <MainNav />
      </div>

      <div className="relative min-h-screen md:pl-20">
        {/* Background Layer */}
        <div className="fixed inset-0" style={{ zIndex: 0 }}>
          {themeState.backgroundType === 'scene3d-war' as BackgroundType ? (
            <WarScene primaryColor={themeState.customColors.primary} />
          ) : themeState.backgroundType === 'particles' as BackgroundType ? (
            <ParticlesBackground 
              color={themeState.customColors.primary}
              count={50}
              speed={1}
            />
          ) : themeState.backgroundType === 'pattern' as BackgroundType && themeState.pattern ? (
            <AnimatedBackground 
              ref={backgroundRef}
              sceneType="pattern"
              pattern={{
                css: {
                  backgroundImage: themeState.pattern.css.backgroundImage,
                  backgroundSize: themeState.pattern.css.backgroundSize,
                  backgroundColor: themeState.pattern.css.backgroundColor
                }
              }}
              userColor={themeState.customColors.primary}
            />
          ) : themeState.backgroundType === 'waves' as BackgroundType ? (
            <WavesBackground
              color={themeState.customColors.primary}
              speed={1}
              amplitude={50}
            />
          ) : (
            <AnimatedBackground
              sceneType={themeState.backgroundType}
              showTitle={false}
              userColor={themeState.customColors.primary}
            />
          )}
          <div className="absolute inset-0 backdrop-blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-screen flex flex-col">
          <div 
            className="flex-1 bg-black/40 backdrop-blur-xl overflow-hidden 
                     flex flex-col shadow-2xl shadow-black/50"
            style={{ borderColor: `${themeState.customColors.primary}20` }}
          >
            {/* Header with glass effect */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-4 border-b backdrop-blur-xl bg-black/40 sticky top-0 z-20"
              style={{ borderColor: `${themeState.customColors.primary}20` }}
            >
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/messages')}
                    className="w-10 h-10 rounded-full flex items-center justify-center
                             hover:bg-white/10 transition-colors md:hidden"
                  >
                    <FiArrowLeft className="w-5 h-5 text-white" />
                  </motion.button>
                  
                  {otherUser && (
                    <div className="flex items-center gap-3">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="relative"
                      >
                        <img
                          src={otherUser.avatar_url || "/default-avatar.png"}
                          alt={otherUser.username}
                          className="w-12 h-12 rounded-full border-2 object-cover"
                          style={{ borderColor: themeState.customColors.primary }}
                        />
                        {otherUser.online && (
                          <div 
                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500
                                     border-2 border-black"
                          />
                        )}
                      </motion.div>
                      <div>
                        <h3 
                          className="font-medium text-lg"
                          style={{ color: themeState.customColors.primary }}
                        >
                          {otherUser.username}
                        </h3>
                        <AnimatePresence>
                          {isTyping ? (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-xs text-green-400"
                            >
                              typing...
                            </motion.span>
                          ) : otherUser.online ? (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-xs text-green-500"
                            >
                              Online
                            </motion.span>
                          ) : otherUser.last_seen ? (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-xs text-gray-400"
                            >
                              Last seen {formatMessageTime(new Date(otherUser.last_seen))}
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center
                           hover:bg-white/10 transition-colors"
                >
                  <FiMoreVertical className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </motion.div>

            {/* Messages with smooth scroll */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <MessagesList messages={messages} primaryColor={themeState.customColors.primary} onReply={handleReply} onDelete={handleDeleteMessage} />
              <div ref={messagesEndRef} />
            </div>

            {/* Message input with modern features */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-black/90 backdrop-blur-md border-t"
              style={{ borderColor: `${themeState.customColors.primary}20` }}
            >
              <div className="max-w-4xl mx-auto px-4 py-3">
                <form 
                  className="flex gap-2 items-end"
                  onSubmit={handleSendMessage}
                >
                  <div className="flex gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsAttachmentSheetOpen(true)}
                      className="w-10 h-10 rounded-full flex items-center justify-center
                               hover:bg-white/10 transition-colors"
                    >
                      <FiPaperclip className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  </div>

                  <div className="flex-1 relative">
                    {replyTo && (
                      <div className="absolute bottom-full mb-2 left-0 right-0 p-2 bg-black/40 
                                   backdrop-blur-sm rounded-t-xl border-t border-l border-r"
                           style={{ borderColor: `${themeState.customColors.primary}20` }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Replying to message</span>
                          <button 
                            onClick={() => setReplyTo(null)}
                            className="p-1 hover:bg-white/10 rounded-full"
                          >
                            <FiX className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                        <div className="text-sm text-white truncate mt-1">
                          {replyTo.type === 'text' ? replyTo.content : `${replyTo.type} message`}
                        </div>
                      </div>
                    )}
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)
                        handleTyping()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(e)
                        }
                      }}
                      placeholder="Type a message..."
                      style={{ 
                        borderColor: `${themeState.customColors.primary}20`,
                        minHeight: '44px',
                        maxHeight: '120px'
                      }}
                      className="w-full bg-black/30 text-white rounded-2xl px-4 py-3
                               border focus:outline-none placeholder:text-gray-500
                               resize-none overflow-hidden"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={!newMessage.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full flex items-center justify-center
                             disabled:opacity-50 transition-colors"
                    style={{ 
                      backgroundColor: themeState.customColors.primary,
                      boxShadow: `0 0 20px ${themeState.customColors.primary}40`
                    }}
                  >
                    <FiSend className="w-5 h-5 text-black" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Attachment Bottom Sheet */}
        <BottomSheet
          isOpen={isAttachmentSheetOpen}
          onClose={() => setIsAttachmentSheetOpen(false)}
          height="30vh"
          className="md:max-w-[50%] md:mx-auto"
        >
          <div className="grid grid-cols-4 gap-4">
            {[
              { 
                icon: FiImage, 
                label: 'Photo',
                onClick: () => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                  input.onchange = handlePhotoUpload;
                  input.click();
                }
              },
              { 
                icon: FiPaperclip, 
                label: 'File',
                onClick: () => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  // @ts-expect-error: This is a temporary fix to allow the form data to be updated
                  input.onchange = handleFileUpload;
                  input.click();
                }
              },
              { 
                icon: FiMic, 
                label: 'Voice',
                onClick: isRecording ? stopRecording : startRecording
              },
              { 
                icon: FiSmile, 
                label: 'GIF', 
                onClick: () => {
                  setShowGifSelector(true);
                  setIsAttachmentSheetOpen(false);
                }
              }
            ].map((option) => (
              <motion.button
                key={option.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={option.onClick}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl
                          bg-white/5 hover:bg-white/10 transition-colors
                          ${option.label === 'Voice' && isRecording ? 'bg-red-500/30' : ''}`}
              >
                <option.icon 
                  className="w-6 h-6"
                  style={{ color: themeState.customColors.primary }}
                />
                <span className="text-sm text-white">
                  {option.label === 'Voice' && isRecording ? 'Stop' : option.label}
                </span>
              </motion.button>
            ))}
          </div>
        </BottomSheet>

        <BottomSheet
          isOpen={showGifSelector}
          onClose={() => setShowGifSelector(false)}
          height="70vh"
        >
          <GifSelector
            onSelect={handleGifSelect}
            onClose={() => setShowGifSelector(false)}
            primaryColor={themeState.customColors.primary}
          />
        </BottomSheet>
      </div>
    </PageTransition>
  )
} 
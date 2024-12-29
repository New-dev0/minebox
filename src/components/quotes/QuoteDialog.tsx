import { useState } from 'react'
import Dialog from '../shared/Dialog'
import QuoteInput from './QuoteInput'
import QuoteActions from './QuoteActions'

interface QuoteDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { text: string }) => void
  primaryColor?: string
}

export default function QuoteDialog({ 
  isOpen, 
  onClose, 
  onSubmit,
  primaryColor = '#8B5CF6'
}: QuoteDialogProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit({ text: text.trim() })
    setText('')
    onClose()
  }

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Write your quote"
      maxWidth="md"
      align="center"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <QuoteInput 
          value={text}
          onChange={setText}
          primaryColor={primaryColor}
        />
        <QuoteActions 
          onCancel={onClose}
          onSubmit={handleSubmit}
          primaryColor={primaryColor}
        />
      </form>
    </Dialog>
  )
} 
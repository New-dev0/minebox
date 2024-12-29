import { useEffect, useRef } from 'react'

type HTML5GameProps = {
  url: string
  title: string
  onError?: () => void
}

export default function HTML5Game({ url, title, onError }: HTML5GameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleError = () => {
      console.error(`Failed to load game: ${title}`)
      onError?.()
    }

    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener('error', handleError)
      return () => iframe.removeEventListener('error', handleError)
    }
  }, [title, onError])

  return (
    <iframe
      ref={iframeRef}
      src={url}
      title={title}
      className="w-full h-full border-0 rounded-lg"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    />
  )
} 
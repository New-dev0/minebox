import { useEffect } from 'react'
import type { HTML5Game } from '../config'

declare global {
  interface Window {
    GD_OPTIONS: any
    SDK_OPTIONS: any
    gdsdk: any
  }
}

type GameDistributionProps = {
  game: HTML5Game
  onError?: () => void
}

export default function GameDistribution({ game, onError }: GameDistributionProps) {
  useEffect(() => {
    // Load GameDistribution SDK
    const script = document.createElement('script')
    script.src = 'https://html5.api.gamedistribution.com/main.min.js'
    script.async = true
    
    script.onerror = () => {
      console.error('Failed to load GameDistribution SDK')
      onError?.()
    }

    // Initialize SDK
    window.GD_OPTIONS = {
      gameId: game.gameId,
      advertisementSettings: {
        autoplay: false,
      },
      onEvent: (event: any) => {
        switch (event.name) {
          case 'SDK_GAME_START':
            // Resume game
            break
          case 'SDK_GAME_PAUSE':
            // Pause game
            break
          case 'SDK_ERROR':
            console.error('GameDistribution SDK Error:', event.message)
            onError?.()
            break
        }
      },
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
      delete window.GD_OPTIONS
    }
  }, [game.gameId, onError])

  return (
    <div className="w-full h-full">
      <iframe
        src={game.url}
        title={game.title}
        className="w-full h-full border-0 rounded-lg"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  )
} 
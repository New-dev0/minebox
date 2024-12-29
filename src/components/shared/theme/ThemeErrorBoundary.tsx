import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FiAlertTriangle } from 'react-icons/fi'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ThemeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Theme error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-black flex items-center justify-center p-4"
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md text-center">
            <FiAlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Theme Error</h2>
            <p className="text-gray-300 mb-4">
              {this.state.error?.message || 'An error occurred while loading the theme'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30
                       transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
} 
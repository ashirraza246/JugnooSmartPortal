'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ModuleErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[300px] p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Module Load Nahi Ho Saka</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Is section ko load karte waqt masla aa gaya. Page refresh karein ya dobara try karein.
              </p>
            </div>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Dobara Try Karein
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

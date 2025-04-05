'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Xatolik yuz berdi!</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>{this.state.error?.message || 'Kutilmagan xatolik yuz berdi'}</p>
            <Button onClick={this.reset} variant="outline">
              Qayta urinib ko'ring
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

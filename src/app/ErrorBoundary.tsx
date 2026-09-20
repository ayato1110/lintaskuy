import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Application error:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface p-6">
          <div className="card-subtle max-w-md p-6 text-center" role="alert">
            <h1 className="text-lg font-semibold text-ink">Terjadi kesalahan pada aplikasi</h1>
            <p className="mt-2 text-sm text-muted">
              Aplikasi diatur ulang ke kondisi awal agar dapat digunakan kembali.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.assign(import.meta.env.BASE_URL);
                }}
              >
                Kembali ke halaman awal
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
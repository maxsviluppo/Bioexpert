

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}


class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }


  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }


  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }


  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', color: '#333', maxWidth: 600, margin: '20px auto' }}>
          <h1 style={{ color: '#BA1A1A' }}>Errore Imprevisto 😔</h1>
          <p>L'applicazione ha riscontrato un errore critico.</p>
          <div style={{ background: '#fee', padding: 15, borderRadius: 8, overflow: 'auto', fontFamily: 'monospace', border: '1px solid #fcc', fontSize: 13, marginBottom: 20 }}>
            {this.state.error?.toString()}
          </div>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', fontSize: 16, background: '#333', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Ricarica Pagina
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

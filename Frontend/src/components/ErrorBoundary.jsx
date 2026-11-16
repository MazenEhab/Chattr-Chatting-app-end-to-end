import React from "react"

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error("[Chattr] A React component failed to render.", error, info)
  }

  render() {
    const { error } = this.state

    if (error) {
      return (
        <main className="error-screen" role="alert">
          <section className="error-panel">
            <p className="error-kicker">CHATTR · RENDER ERROR</p>
            <h1>This part of Chattr couldn't load.</h1>
            <p className="error-summary">
              A React component threw an error while rendering. Other routes remain protected and can still be opened.
            </p>
            <h2>Error details</h2>
            <pre className="error-details">{error.message || String(error)}</pre>
            <p className="error-help">
              Check the component and the data it received. The error details above show what failed;
              the browser console contains the component stack.
            </p>
            <div className="error-actions">
              <button type="button" onClick={() => this.setState({ error: null })}>Try this page again</button>
              <button type="button" className="secondary" onClick={() => window.location.reload()}>Reload Chattr</button>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error('CampusGenome render error:', error);
  }
  render() {
    if (this.state.failed)
      return (
        <div className="empty-state" role="alert">
          <span className="eyebrow">CAMPUS GENOME</span>
          <h1>Let's find our way back.</h1>
          <p>Something interrupted this page. Reload to reconnect with your campus.</p>
          <button className="button button-primary" onClick={() => location.reload()}>
            Reload the page
          </button>
        </div>
      );
    return this.props.children;
  }
}

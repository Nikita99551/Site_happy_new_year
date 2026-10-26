import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { error: Error | null }

/** Ошибка в рендере не оставляет белый экран: показываем сообщение и кнопку перезагрузки */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Ошибка на странице', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main>
        <section className="section section--green on-dark" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: 640 }}>
            <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', color: '#fff8e8' }}>Что-то пошло не так</h1>
            <p className="lead" style={{ marginTop: 16 }}>Обновите страницу. Если ошибка повторится, попробуйте зайти позже&nbsp;— ваши чеки и&nbsp;шаги сохранены.</p>
            <p style={{ marginTop: 28 }}><button className="btn" type="button" onClick={() => window.location.reload()}>Обновить страницу</button></p>
          </div>
        </section>
      </main>
    );
  }
}

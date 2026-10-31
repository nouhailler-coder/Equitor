import React from 'react';

/**
 * Filet de sécurité : une erreur inattendue dans un écran affiche un message
 * au lieu d'une page blanche. Les données enregistrées ne sont pas affectées.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="rounded-2xl bg-white dark:bg-stone-900 border border-red-200 dark:border-red-900 p-6 text-center space-y-3">
        <p className="text-4xl" aria-hidden="true">🐴</p>
        <p className="font-bold text-stone-900 dark:text-stone-100">Cet écran a rencontré un problème.</p>
        <p className="text-sm text-stone-600 dark:text-stone-300">Vos données enregistrées ne sont pas touchées. Revenez à l’accueil ou rechargez l’application.</p>
        <div className="flex justify-center gap-2">
          <button className="rounded-xl bg-brand-900 text-white px-4 py-2.5 text-sm font-semibold" onClick={() => { window.location.hash = '#/accueil'; this.setState({ failed: false }); }}>
            Retour à l’accueil
          </button>
          <button className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold" onClick={() => window.location.reload()}>
            Recharger
          </button>
        </div>
      </div>
    );
  }
}

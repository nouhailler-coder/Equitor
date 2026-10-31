import React, { useState } from 'react';
import { BEHAVIORS, BEHAVIOR_THEMES, type BehaviorTheme } from '../../data/behaviors';
import { BehaviorHead } from '../../components/ui/BehaviorHead';
import { Chips, EmptyState, FavoriteButton, Link, PageHeader, btn, card } from '../../components/ui/kit';
import { navigate } from '../../app/router';

const THEME_LABEL = Object.fromEntries(BEHAVIOR_THEMES.map((t) => [t.id, t.label])) as Record<BehaviorTheme, string>;

const Warning = () => (
  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-900 dark:text-amber-200">
    ⚠️ Un signal isolé ne permet pas de conclure avec certitude à un état émotionnel ou médical. Observez l’ensemble du cheval, dans son contexte, et demandez l’avis d’un professionnel en cas de doute.
  </div>
);

export const BehaviorView: React.FC = () => {
  const [theme, setTheme] = useState<BehaviorTheme | 'tous'>('tous');
  const list = BEHAVIORS.filter((b) => theme === 'tous' || b.theme === theme);
  return (
    <div className="space-y-4">
      <PageHeader title="Comportement et langage" icon="👂" back="ressources" subtitle="Lire le cheval… avec prudence" />
      <Warning />
      <Chips label="Thème" value={theme} onChange={setTheme} options={[{ id: 'tous', label: 'Tous' }, ...BEHAVIOR_THEMES.filter((t) => BEHAVIORS.some((b) => b.theme === t.id)).map((t) => ({ id: t.id, label: t.label }))]} />
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {list.map((b) => (
          <li key={b.id}>
            <Link to={`ressources/comportement/${b.id}`} className={`${card} p-2 block h-full hover:border-emerald-500`}>
              <BehaviorHead ill={b.illustration} title={`Illustration : ${b.title}`} />
              <span className="block font-bold text-sm text-stone-900 dark:text-stone-100 mt-2 px-1 leading-tight">{b.title}</span>
              <span className="block text-[11px] text-stone-500 px-1">{THEME_LABEL[b.theme]}</span>
            </Link>
          </li>
        ))}
      </ul>
      <button className={btn('secondary', 'w-full')} onClick={() => navigate('pratiquer/exercice/ex-comportement-langage')}>🧩 S’exercer à lire le langage du cheval</button>
    </div>
  );
};

export const BehaviorDetail: React.FC<{ id: string }> = ({ id }) => {
  const b = BEHAVIORS.find((x) => x.id === id);
  if (!b) return <EmptyState icon="🔍" title="Comportement introuvable" />;
  return (
    <div className="space-y-4">
      <PageHeader title={b.title} subtitle={THEME_LABEL[b.theme]} back="ressources/comportement" actions={<FavoriteButton type="behavior" targetId={b.id} label={b.title} />} />
      <div className={`${card} p-3 max-w-sm mx-auto`}><BehaviorHead ill={b.illustration} title={`Illustration : ${b.title}`} /></div>
      <div className={`${card} p-4 space-y-3 text-sm`}>
        <p className="text-stone-700 dark:text-stone-300">{b.description}</p>
        <div>
          <p className="font-bold text-stone-900 dark:text-stone-100">Interprétations possibles</p>
          <ul className="list-disc pl-5 text-stone-700 dark:text-stone-300">{b.interpretations.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
        <p><strong className="text-stone-900 dark:text-stone-100">Contextes : </strong><span className="text-stone-700 dark:text-stone-300">{b.contexts}</span></p>
        <p><strong className="text-stone-900 dark:text-stone-100">Points de vigilance : </strong><span className="text-stone-700 dark:text-stone-300">{b.vigilance}</span></p>
        <p><strong className="text-stone-900 dark:text-stone-100">Précautions : </strong><span className="text-stone-700 dark:text-stone-300">{b.precautions}</span></p>
      </div>
      {b.professional && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-sm text-red-900 dark:text-red-200">
          🩺 <strong>Quand demander l’avis d’un professionnel :</strong> {b.professional}
        </div>
      )}
      <Warning />
    </div>
  );
};

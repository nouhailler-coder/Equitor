import React, { useState } from 'react';
import { EQUIPMENT, EQUIPMENT_CATEGORIES, type EquipmentCategory } from '../../data/equipment';
import { INTERACTIVE_VIEWS } from '../../data/interactiveViews';
import { DICTIONARY_BY_ID } from '../../data/dictionary';
import { EXERCISE_BY_ID, LESSON_BY_ID } from '../../data/catalog';
import { InteractiveSvg } from '../../components/ui/InteractiveSvg';
import { Chips, EmptyState, FavoriteButton, Link, PageHeader, btn, card } from '../../components/ui/kit';
import { navigate } from '../../app/router';
import { overlays } from '../../app/overlays';

export const EquipmentView: React.FC = () => {
  const [cat, setCat] = useState<EquipmentCategory | 'tous'>('tous');
  const list = EQUIPMENT.filter((e) => cat === 'tous' || e.category === cat);
  return (
    <div className="space-y-4">
      <PageHeader title="Atelier du matériel" icon="🧰" back="ressources" subtitle="Connaître, vérifier et entretenir le matériel" help="Connaissances générales. Le choix et le réglage du matériel pour un cheval et un cavalier donnés relèvent d’un professionnel." />
      <Chips label="Catégorie" value={cat} onChange={setCat} options={[{ id: 'tous', label: 'Tout' }, ...EQUIPMENT_CATEGORIES.filter((c) => EQUIPMENT.some((e) => e.category === c.id)).map((c) => ({ id: c.id, label: c.label }))]} />
      <ul className="grid sm:grid-cols-2 gap-3">
        {list.map((e) => (
          <li key={e.id}>
            <Link to={`ressources/materiel/${e.id}`} className={`${card} p-4 flex items-center gap-3 hover:border-emerald-500 h-full`}>
              <span className="text-3xl" aria-hidden="true">{e.icon}</span>
              <span>
                <span className="block font-bold text-stone-900 dark:text-stone-100">{e.name}</span>
                <span className="block text-xs text-stone-500 dark:text-stone-400">{e.fonction}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ListBlock: React.FC<{ title: string; items: string[]; icon: string }> = ({ title, items, icon }) => (
  <div className={`${card} p-4`}>
    <h2 className="text-xs font-bold uppercase text-stone-500 mb-2">{icon} {title}</h2>
    <ul className="list-disc pl-5 space-y-1 text-sm text-stone-700 dark:text-stone-300">{items.map((i) => <li key={i}>{i}</li>)}</ul>
  </div>
);

export const EquipmentDetail: React.FC<{ id: string }> = ({ id }) => {
  const e = EQUIPMENT.find((x) => x.id === id);
  const [part, setPart] = useState<string | null>(null);
  if (!e) return <EmptyState icon="🔍" title="Élément introuvable" action={<button className={btn('primary')} onClick={() => navigate('ressources/materiel')}>Atelier du matériel</button>} />;
  const view = e.viewId ? INTERACTIVE_VIEWS[e.viewId] : null;
  return (
    <div className="space-y-4">
      <PageHeader title={e.name} icon={e.icon} back="ressources/materiel" actions={<FavoriteButton type="equipment" targetId={e.id} label={e.name} />} />
      {view && (
        <div className={`${card} p-2`}>
          <InteractiveSvg view={view} selected={part} showLabels onSelect={setPart} />
          <p className="text-[11px] text-stone-500 text-center pb-1">Touchez une partie pour afficher son nom (schéma simplifié)</p>
        </div>
      )}
      <div className={`${card} p-4 space-y-2 text-sm`}>
        <p className="text-stone-700 dark:text-stone-300">{e.description}</p>
        <p><strong className="text-stone-900 dark:text-stone-100">Fonction : </strong><span className="text-stone-700 dark:text-stone-300">{e.fonction}</span></p>
        <p><strong className="text-stone-900 dark:text-stone-100">Utilisation générale : </strong><span className="text-stone-700 dark:text-stone-300">{e.usage}</span></p>
      </div>
      <div className={`${card} p-4`}>
        <h2 className="text-xs font-bold uppercase text-stone-500 mb-2">🔩 Principales parties</h2>
        <dl className="space-y-1.5 text-sm">
          {e.parts.map((p) => (
            <div key={p.name}>
              <dt className="font-bold text-stone-900 dark:text-stone-100 inline">{p.name} : </dt>
              <dd className="inline text-stone-700 dark:text-stone-300">{p.role}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ListBlock title="Vérifications de sécurité" icon="🛡️" items={e.safetyChecks} />
      <ListBlock title="Entretien" icon="🧽" items={e.maintenance} />
      <ListBlock title="Erreurs fréquentes" icon="⚠️" items={e.commonMistakes} />
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-900 dark:text-amber-200">
        Aucun réglage personnalisé n’est proposé ici : l’adaptation du matériel se fait avec un professionnel (enseignant, sellier…).
      </div>
      {(e.termIds.length > 0 || e.lessonIds.length > 0) && (
        <div className={`${card} p-4 flex flex-wrap gap-1.5`}>
          {e.termIds.map((t) => <Link key={t} to={`ressources/dictionnaire/${t}`} className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 text-xs font-semibold">📖 {DICTIONARY_BY_ID[t]?.term}</Link>)}
          {e.lessonIds.map((l) => <button key={l} onClick={() => overlays.openLesson(l)} className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1 text-xs font-semibold">📄 {LESSON_BY_ID[l]?.titleFr}</button>)}
        </div>
      )}
      {e.exerciseId && <button className={btn('primary', 'w-full')} onClick={() => navigate(`pratiquer/exercice/${e.exerciseId}`)}>🧩 {EXERCISE_BY_ID[e.exerciseId]?.title}</button>}
    </div>
  );
};

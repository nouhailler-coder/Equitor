import React, { useState, useEffect } from 'react';
import type { Horse, RidingSession } from '../../types';
import { db } from '../../db';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionSaved?: () => void;
  sessionToEdit?: RidingSession | null;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  onSessionSaved,
  sessionToEdit,
}) => {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedHorseId, setSelectedHorseId] = useState('');
  const [customHorseName, setCustomHorseName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [theme, setTheme] = useState('Travail sur le plat — Transitions & Cadence');
  const [objectives, setObjectives] = useState('Échauffement progressif au pas 10 min, rectitude au trot, décontraction');
  const [exercises, setExercises] = useState('Cercles de 20 m, demi-arrêts, transitions pas-trot');
  const [observations, setObservations] = useState('');
  const [horseWelfareNotes, setHorseWelfareNotes] = useState('');
  const [riderFeelScore, setRiderFeelScore] = useState(4);
  const [horseRelaxationScore, setHorseRelaxationScore] = useState(4);
  const [successes, setSuccesses] = useState('');
  const [difficulties, setDifficulties] = useState('');
  const [nextGoals, setNextGoals] = useState('');

  useEffect(() => {
    const loadHorses = async () => {
      const list = await db.horses.toArray();
      setHorses(list);
      if (list.length > 0 && !selectedHorseId) {
        setSelectedHorseId(list[0].id);
      }
    };
    if (isOpen) {
      loadHorses();

      if (sessionToEdit) {
        setSelectedHorseId(sessionToEdit.horseId || '');
        setCustomHorseName(sessionToEdit.horseName || '');
        setDate(sessionToEdit.date);
        setDurationMinutes(sessionToEdit.durationMinutes);
        setTheme(sessionToEdit.theme);
        setObjectives(sessionToEdit.objectives.join(', '));
        setExercises(sessionToEdit.exercises.join(', '));
        setObservations(sessionToEdit.observations || '');
        setHorseWelfareNotes(sessionToEdit.horseWelfareNotes || '');
        setRiderFeelScore(sessionToEdit.riderFeelScore || 3);
        setHorseRelaxationScore(sessionToEdit.horseRelaxationScore || 3);
        setSuccesses(sessionToEdit.successes || '');
        setDifficulties(sessionToEdit.difficulties || '');
        setNextGoals(sessionToEdit.nextGoals || '');
      }
    }
  }, [isOpen, sessionToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const matchedHorse = horses.find((h) => h.id === selectedHorseId);
    const horseNameFinal = matchedHorse ? matchedHorse.name : customHorseName.trim() || 'Cheval non spécifié';

    const now = Date.now();
    const sessionData: RidingSession = {
      id: sessionToEdit ? sessionToEdit.id : `session_${now}_${Math.random().toString(36).substring(2, 7)}`,
      horseId: selectedHorseId || undefined,
      horseName: horseNameFinal,
      date,
      durationMinutes: Number(durationMinutes) || 45,
      theme: theme.trim() || 'Séance de travail',
      objectives: objectives.split(',').map((s) => s.trim()).filter(Boolean),
      exercises: exercises.split(',').map((s) => s.trim()).filter(Boolean),
      observations: observations.trim(),
      horseWelfareNotes: horseWelfareNotes.trim(),
      riderFeelScore,
      horseRelaxationScore,
      successes: successes.trim(),
      difficulties: difficulties.trim(),
      nextGoals: nextGoals.trim(),
      createdAt: sessionToEdit ? sessionToEdit.createdAt : now,
      updatedAt: now,
    };

    await db.ridingSessions.put(sessionData);
    if (onSessionSaved) onSessionSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-center justify-between border-b border-emerald-950">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <span>Journal de Pratique</span>
              <span>•</span>
              <span>Mode Écurie</span>
            </div>
            <h2 className="text-lg font-black text-white">
              {sessionToEdit ? 'Modifier la séance' : 'Préparer & Débriefer une séance'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 text-stone-300 hover:text-white hover:bg-emerald-900 transition"
          >
            ✕
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-stone-900 text-xs sm:text-sm">
          {/* Section 1: Cheval, Date, Durée */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              1. Informations de base
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cheval */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Cheval
                </label>
                {horses.length > 0 ? (
                  <select
                    value={selectedHorseId}
                    onChange={(e) => setSelectedHorseId(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs"
                  >
                    {horses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.nickname ? `(${h.nickname})` : ''}
                      </option>
                    ))}
                    <option value="">Autre cheval (saisie libre)...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customHorseName}
                    onChange={(e) => setCustomHorseName(e.target.value)}
                    placeholder="Nom du cheval..."
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs"
                  />
                )}
                {horses.length > 0 && selectedHorseId === '' && (
                  <input
                    type="text"
                    value={customHorseName}
                    onChange={(e) => setCustomHorseName(e.target.value)}
                    placeholder="Préciser le nom..."
                    className="w-full p-2 mt-1.5 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs"
                  />
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Date de la séance
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs"
                />
              </div>

              {/* Durée */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  min="10"
                  max="240"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs"
                />
              </div>
            </div>

            {/* Thème principal */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-xs">
                Thème principal de la séance
              </label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Demi-arrêt et équilibre, Barres au sol, Sortie extérieur..."
                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs"
              />
            </div>
          </div>

          {/* Section 2: Préparation & Objectifs */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              2. Objectifs ciblés &amp; Exercices prévus
            </h3>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-xs">
                Objectifs recherchés (séparés par des virgules)
              </label>
              <input
                type="text"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="Ex: Relâchement du dos, régularité du trot, franchise au galop"
                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-xs">
                Exercices clés abordés
              </label>
              <input
                type="text"
                value={exercises}
                onChange={(e) => setExercises(e.target.value)}
                placeholder="Ex: Huit de chiffre, serpentine 3 boucles, transitions rapprochées"
                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs"
              />
            </div>
          </div>

          {/* Section 3: Bilan & Bien-être équin */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
            <h3 className="text-xs font-bold text-sky-900 uppercase tracking-wider">
              3. Débriefing &amp; Bien-être du cheval
            </h3>

            {/* Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-2.5 rounded-lg border border-stone-300">
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Ressenti cavalier (1 à 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRiderFeelScore(star)}
                      className={`text-lg transition ${
                        star <= riderFeelScore ? 'text-amber-500 scale-110' : 'text-stone-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-600 ml-1">
                    {riderFeelScore}/5
                  </span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-stone-300">
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Décontraction du cheval (1 à 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setHorseRelaxationScore(star)}
                      className={`text-lg transition ${
                        star <= horseRelaxationScore ? 'text-emerald-500 scale-110' : 'text-stone-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-600 ml-1">
                    {horseRelaxationScore}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Welfare notes */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-xs">
                Observations physiques &amp; comportementales du cheval
              </label>
              <textarea
                value={horseWelfareNotes}
                onChange={(e) => setHorseWelfareNotes(e.target.value)}
                placeholder="Ex: Bonne mastication du mors, souplesse au trot, aucune sensibilité dorsale au pansage..."
                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs min-h-[50px]"
              />
            </div>

            {/* Successes & Difficulties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-emerald-800 mb-1 text-xs">
                  Points forts &amp; Réussites
                </label>
                <textarea
                  value={successes}
                  onChange={(e) => setSuccesses(e.target.value)}
                  placeholder="Ce qui a bien fonctionné..."
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs min-h-[50px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-rose-800 mb-1 text-xs">
                  Difficultés rencontrées
                </label>
                <textarea
                  value={difficulties}
                  onChange={(e) => setDifficulties(e.target.value)}
                  placeholder="Ce qui a résisté ou posé question..."
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs min-h-[50px]"
                />
              </div>
            </div>

            {/* Next goals */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-xs">
                Objectif de la prochaine séance (ou point à aborder avec le moniteur)
              </label>
              <input
                type="text"
                value={nextGoals}
                onChange={(e) => setNextGoals(e.target.value)}
                placeholder="Ex: Demander à l’instructeur de vérifier ma position au galop à gauche..."
                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              {sessionToEdit ? 'Mettre à jour' : 'Enregistrer la séance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

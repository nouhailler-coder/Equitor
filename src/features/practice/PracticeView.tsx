import React, { useState, useEffect } from 'react';
import type { RidingSession, Horse } from '../../types';
import { db } from '../../db';
import { ChecklistsModal } from './ChecklistsModal';
import { HorseManagerModal } from './HorseManagerModal';
import { NewSessionModal } from './NewSessionModal';

export const PracticeView: React.FC = () => {
  const [sessions, setSessions] = useState<RidingSession[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isHorseManagerOpen, setIsHorseManagerOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<RidingSession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<RidingSession | null>(null);
  const [selectedHorseFilter, setSelectedHorseFilter] = useState<string>('tous');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const loadData = async () => {
    const sList = await db.ridingSessions.orderBy('date').reverse().toArray();
    setSessions(sList);
    const hList = await db.horses.toArray();
    setHorses(hList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditSession = (session: RidingSession) => {
    setSessionToEdit(session);
    setIsNewSessionOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    await db.ridingSessions.delete(sessionToDelete.id);
    setSessionToDelete(null);
    await loadData();
  };

  const filteredSessions = sessions.filter((s) => {
    if (selectedHorseFilter === 'tous') return true;
    return s.horseId === selectedHorseFilter || s.horseName === selectedHorseFilter;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner / Mode Écurie */}
      <div className="rounded-3xl bg-gradient-to-r from-[#162e24] via-[#1c382c] to-[#12241c] p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">
          <span>Mode Écurie &amp; Manège</span>
          <span>•</span>
          <span>100% Hors Ligne</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Pratique, Checklists &amp; Journal
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-lg leading-relaxed">
          Outil tactile conçu pour l'écurie : vérifiez votre matériel, organisez vos objectifs avant de monter et enregistrez vos ressentis à pied après la séance.
        </p>

        {/* Action cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
          <button
            onClick={() => {
              setSessionToEdit(null);
              setIsNewSessionOpen(true);
            }}
            className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏇</span>
              <div className="text-left">
                <div>Nouvelle séance</div>
                <div className="text-[10px] font-normal opacity-80">Préparer ou débriefer</div>
              </div>
            </div>
            <span>+</span>
          </button>

          <button
            onClick={() => setIsChecklistOpen(true)}
            className="p-3.5 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm border border-emerald-700/60 shadow-xs transition active:scale-95 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📋</span>
              <div className="text-left">
                <div>Checklists sécurité</div>
                <div className="text-[10px] font-normal text-emerald-200">Cavalier &amp; harnachement</div>
              </div>
            </div>
            <span>→</span>
          </button>

          <button
            onClick={() => setIsHorseManagerOpen(true)}
            className="p-3.5 rounded-2xl bg-stone-900/80 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm border border-stone-700 shadow-xs transition active:scale-95 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🐴</span>
              <div className="text-left">
                <div>Mes chevaux ({horses.length})</div>
                <div className="text-[10px] font-normal text-stone-300">Gérer les profils locaux</div>
              </div>
            </div>
            <span>⚙️</span>
          </button>
        </div>
      </div>

      {/* Sessions history header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>📖</span>
            <span>Journal de bord des séances ({sessions.length})</span>
          </h3>
          <p className="text-xs text-stone-500">
            Historique privé stocké exclusivement sur votre téléphone
          </p>
        </div>

        {/* Filter by horse */}
        {horses.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Filtrer par cheval :</span>
            <select
              value={selectedHorseFilter}
              onChange={(e) => setSelectedHorseFilter(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-900 font-semibold outline-none"
            >
              <option value="tous">Tous les chevaux</option>
              {horses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sessions list */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center text-stone-500 space-y-3">
          <span className="text-4xl block">🐎</span>
          <h4 className="font-bold text-base text-stone-800">
            Aucune séance enregistrée pour l'instant
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Préparez votre première séance d'équitation ou consignez vos ressentis après être descendu de cheval.
          </p>
          <button
            onClick={() => {
              setSessionToEdit(null);
              setIsNewSessionOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#162e24] text-white font-bold text-xs hover:bg-[#1f3f31] transition"
          >
            + Enregistrer ma première séance
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition hover:border-emerald-300"
              >
                {/* Summary bar */}
                <div
                  onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 font-black text-sm flex items-center justify-center border border-emerald-200 shrink-0">
                      🏇
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-sm text-stone-900">
                          {session.horseName || 'Cheval'}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs text-stone-500 font-medium">
                          {session.date} ({session.durationMinutes} min)
                        </span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-emerald-950">
                        {session.theme}
                      </h4>
                      {session.objectives.length > 0 && (
                        <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                          Obj. : {session.objectives.join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden xs:block">
                      <div className="text-xs font-bold text-amber-600">
                        Ressenti : {'★'.repeat(session.riderFeelScore)}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700">
                        Cheval : {'★'.repeat(session.horseRelaxationScore)}
                      </div>
                    </div>
                    <span className="text-stone-400 font-bold text-lg">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 bg-stone-50/60 space-y-3 text-xs sm:text-sm text-stone-800">
                    {/* Objectives & exercises */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      <div className="bg-white p-3 rounded-xl border border-stone-200">
                        <span className="font-bold text-stone-700 block mb-1">
                          🎯 Objectifs ciblés :
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
                          {session.objectives.map((o, idx) => (
                            <li key={idx}>{o}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-stone-200">
                        <span className="font-bold text-stone-700 block mb-1">
                          🐎 Exercices réalisés :
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
                          {session.exercises.map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Horse welfare */}
                    {session.horseWelfareNotes && (
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950">
                        <span className="font-bold block mb-0.5">
                          🩺 Observations physiques &amp; bien-être du cheval :
                        </span>
                        <p>{session.horseWelfareNotes}</p>
                      </div>
                    )}

                    {/* Successes & Difficulties */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {session.successes && (
                        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                          <span className="font-bold text-emerald-900 block mb-0.5">
                            ✓ Points forts &amp; Réussites :
                          </span>
                          <p className="text-stone-700">{session.successes}</p>
                        </div>
                      )}
                      {session.difficulties && (
                        <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200">
                          <span className="font-bold text-rose-900 block mb-0.5">
                            ⚠️ Difficultés rencontrées :
                          </span>
                          <p className="text-stone-700">{session.difficulties}</p>
                        </div>
                      )}
                    </div>

                    {/* Next goals */}
                    {session.nextGoals && (
                      <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-amber-950">
                        <span className="font-bold block mb-0.5">
                          📌 Pour la prochaine séance / À voir avec l’enseignant :
                        </span>
                        <p>{session.nextGoals}</p>
                      </div>
                    )}

                    {/* Edit and Delete action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleEditSession(session)}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 font-semibold text-xs text-stone-700"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setSessionToDelete(session)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 font-semibold text-xs text-rose-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete session confirmation modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-stone-200 text-stone-900 space-y-3">
            <h3 className="font-bold text-base text-rose-900 flex items-center gap-2">
              <span>⚠️</span>
              <span>Supprimer la séance ?</span>
            </h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              Voulez-vous vraiment supprimer la séance du <strong>{sessionToDelete.date}</strong> ({sessionToDelete.theme}) ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSessionToDelete(null)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteSession}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ChecklistsModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
      />
      <HorseManagerModal
        isOpen={isHorseManagerOpen}
        onClose={() => setIsHorseManagerOpen(false)}
        onHorsesUpdated={loadData}
      />
      <NewSessionModal
        isOpen={isNewSessionOpen}
        onClose={() => {
          setIsNewSessionOpen(false);
          setSessionToEdit(null);
        }}
        onSessionSaved={loadData}
        sessionToEdit={sessionToEdit}
      />
    </div>
  );
};

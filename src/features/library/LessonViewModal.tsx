import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import type { LessonProgress } from '../../types/models';
import { RiskBadge, LevelBadge } from '../../components/common/Badge';
import { RiskWarning } from '../../components/common/RiskWarning';
import { SvgDiagram } from '../../components/common/SvgDiagrams';
import { TermText } from '../../components/ui/TermText';
import { FavoriteButton, NoteEditor, btn } from '../../components/ui/kit';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useEscape } from '../../hooks/useEscape';
import { useLive } from '../../hooks/useLive';
import { db } from '../../services/storage/db';
import { noteId } from '../../services/storage/repos';
import { addReadingTime, recordLessonView, setLessonStatus } from '../../services/progression/progressService';
import { safeWrite } from '../../services/feedback/toast';
import { printLesson } from '../../services/export/print';
import { LESSON_BY_ID, SKILLS, exerciseForLesson } from '../../data/catalog';
import { navigate } from '../../app/router';
import { MasteryChip } from '../progression/SkillsView';

/**
 * Fiche pédagogique. Ouvrir une fiche enregistre la consultation et le temps de lecture ;
 * « J’ai terminé la lecture » marque la fiche lue — la maîtrise, elle, vient des exercices.
 */
export const LessonViewModal: React.FC<{ lessonId: string | null; onClose: () => void }> = ({ lessonId, onClose }) => {
  const lesson = lessonId ? LESSON_BY_ID[lessonId] : null;
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, !!lesson, lessonId);
  const progress = useLive(async () => (lessonId ? ((await db.lessonProgress.get(lessonId)) ?? null) : null), [lessonId], null as LessonProgress | null);
  const skillStates = useLive(() => db.skillProgress.toArray(), [], []);

  useEffect(() => {
    if (!lessonId || !LESSON_BY_ID[lessonId]) return;
    const opened = Date.now();
    void safeWrite(() => recordLessonView(lessonId));
    return () => {
      void addReadingTime(lessonId, (Date.now() - opened) / 1000);
    };
  }, [lessonId]);
  useEscape(!!lesson, onClose);

  if (!lesson) return null;
  const quiz = exerciseForLesson(lesson.id);
  const skills = SKILLS.filter((s) => s.lessonIds.includes(lesson.id));
  const status = progress?.status ?? 'en_cours';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[94dvh] flex flex-col"
      >
        <div className="p-4 sm:p-5 bg-brand-900 text-white flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wide">Chapitre {lesson.chapterNumber} · <span className="text-emerald-200/80 normal-case font-medium">{lesson.sectionThematique}</span></p>
            <h2 id="lesson-title" className="text-lg sm:text-xl font-black leading-tight mt-1">{lesson.titleFr}</h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <FavoriteButton type="lesson" targetId={lesson.id} label={lesson.titleFr} className="text-amber-300" />
            <button onClick={onClose} className="p-2 rounded-xl bg-emerald-950/70 text-stone-200 hover:text-white" aria-label="Fermer la fiche">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-900 dark:text-stone-100">
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={lesson.level} />
            <RiskBadge level={lesson.riskLevel} />
            {skills.map((s) => {
              const st = skillStates.find((x) => x.skillId === s.id)?.state ?? 'non_commence';
              return (
                <button key={s.id} onClick={() => { onClose(); navigate(`progression/competences/${s.id}`); }} className="text-left" title={s.name}>
                  <MasteryChip state={st} />
                </button>
              );
            })}
          </div>

          <RiskWarning riskLevel={lesson.riskLevel} supervisionRequired={lesson.supervisionRequired} advancedPractice={lesson.advancedPractice} customNotice={lesson.safetyNotice} />

          <div className="bg-stone-50 dark:bg-stone-800/60 border-l-4 border-amber-500 p-4 rounded-r-xl">
            <p className="text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">Résumé</p>
            <p className="text-sm sm:text-base leading-relaxed"><TermText text={lesson.summaryFr} /></p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-2">🎯 Objectifs pédagogiques</h3>
            <ul className="space-y-1.5 text-sm text-stone-700 dark:text-stone-300">
              {lesson.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-emerald-600 font-black" aria-hidden="true">✓</span><span>{o}</span></li>
              ))}
            </ul>
          </div>

          {lesson.diagramType && <SvgDiagram type={lesson.diagramType} />}

          <div className="space-y-5">
            {lesson.sections.map((sec, idx) => (
              <section key={idx} className="space-y-2">
                <h3 className="text-base font-bold text-brand-900 dark:text-emerald-300 border-b border-stone-200 dark:border-stone-700 pb-1">{sec.heading}</h3>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line"><TermText text={sec.content} /></p>
                {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                  <ul className="space-y-1 pl-4 text-sm text-stone-600 dark:text-stone-300 list-disc">
                    {sec.bulletPoints.map((bp, b) => <li key={b}><TermText text={bp} /></li>)}
                  </ul>
                )}
                {sec.callout && (
                  <div className={`p-3 rounded-xl text-sm ${sec.callout.type === 'warning' ? 'bg-rose-50 border border-rose-300 text-rose-950 font-medium' : sec.callout.type === 'tip' ? 'bg-amber-50 border border-amber-300 text-amber-950' : 'bg-sky-50 border border-sky-300 text-sky-950'}`}>
                    <span className="font-bold mr-1">{sec.callout.type === 'warning' ? '⚠️ Attention :' : '💡 Conseil :'}</span>
                    {sec.callout.text}
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">👁️ Points à observer</h4>
              <ul className="space-y-1.5 text-xs text-emerald-900">{lesson.observations.map((o, i) => <li key={i}>• {o}</li>)}</ul>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
              <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-2">🚫 Erreurs fréquentes</h4>
              <ul className="space-y-1.5 text-xs text-rose-900">{lesson.commonMistakes.map((m, i) => <li key={i}>✕ {m}</li>)}</ul>
            </div>
          </div>

          {lesson.vocabulary.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Vocabulaire</h4>
              <p className="text-sm text-stone-700 dark:text-stone-300"><TermText text={lesson.vocabulary.join(' · ')} /></p>
            </div>
          )}

          <fieldset className="rounded-xl border border-stone-200 dark:border-stone-700 p-3">
            <legend className="text-xs font-bold text-stone-600 dark:text-stone-300 px-1">Ma lecture</legend>
            <div className="grid grid-cols-2 gap-2">
              <button className={btn(status === 'termine' ? 'secondary' : 'primary', 'text-xs')} aria-pressed={status === 'termine'} onClick={() => void safeWrite(() => setLessonStatus(lesson.id, status === 'termine' ? 'en_cours' : 'termine'), status === 'termine' ? 'Fiche marquée « en cours »' : 'Lecture terminée')}>
                {status === 'termine' ? '✓ Lecture terminée' : 'J’ai terminé la lecture'}
              </button>
              {quiz && (
                <button className={btn('accent', 'text-xs')} onClick={() => { onClose(); navigate(`pratiquer/exercice/${quiz.id}`); }}>
                  🧩 Quiz de la fiche
                </button>
              )}
            </div>
            <p className="text-[11px] text-stone-500 mt-2">Lire une fiche ne suffit pas à maîtriser une compétence : faites les exercices associés.{progress ? ` Consultée ${progress.viewCount} fois.` : ''}</p>
          </fieldset>

          <NoteEditor type="lesson" targetId={lesson.id} />
        </div>

        <div className="p-3 border-t border-stone-200 dark:border-stone-800 flex gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            className={btn('secondary', 'flex-1')}
            onClick={async () => printLesson(lesson, (await db.notes.get(noteId('lesson', lesson.id)))?.text)}
          >
            <Printer className="w-4 h-4" /> PDF
          </button>
          <button className={btn('primary', 'flex-1')} onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

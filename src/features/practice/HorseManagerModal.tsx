import React, { useState, useEffect } from 'react';
import type { Horse } from '../../types';
import { db } from '../../db';

interface HorseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHorsesUpdated?: () => void;
}

export const HorseManagerModal: React.FC<HorseManagerModalProps> = ({
  isOpen,
  onClose,
  onHorsesUpdated,
}) => {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHorseId, setEditingHorseId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [breed, setBreed] = useState('');
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [temperament, setTemperament] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [horseToDelete, setHorseToDelete] = useState<Horse | null>(null);

  const loadHorses = async () => {
    const list = await db.horses.orderBy('createdAt').reverse().toArray();
    setHorses(list);
    if (onHorsesUpdated) onHorsesUpdated();
  };

  useEffect(() => {
    if (isOpen) {
      loadHorses();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setNickname('');
    setBreed('');
    setBirthYear('');
    setTemperament('');
    setSpecialNotes('');
    setIsEditing(false);
    setEditingHorseId(null);
  };

  const handleStartEdit = (h: Horse) => {
    setName(h.name);
    setNickname(h.nickname || '');
    setBreed(h.breed || '');
    setBirthYear(h.birthYear || '');
    setTemperament(h.temperament || '');
    setSpecialNotes(h.specialNotes || '');
    setEditingHorseId(h.id);
    setIsEditing(true);
  };

  const handleSaveHorse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = Date.now();
    const horseData: Horse = {
      id: editingHorseId || `horse_${now}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      breed: breed.trim() || undefined,
      birthYear: birthYear !== '' ? Number(birthYear) : undefined,
      temperament: temperament.trim() || undefined,
      specialNotes: specialNotes.trim() || undefined,
      createdAt: editingHorseId ? (horses.find((h) => h.id === editingHorseId)?.createdAt || now) : now,
      updatedAt: now,
    };

    await db.horses.put(horseData);
    resetForm();
    await loadHorses();
  };

  const confirmDelete = async () => {
    if (!horseToDelete) return;
    await db.horses.delete(horseToDelete.id);
    setHorseToDelete(null);
    await loadHorses();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#162e24] text-white flex items-center justify-between border-b border-emerald-950">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <span>Carnet Équestre</span>
              <span>•</span>
              <span>IndexedDB Local</span>
            </div>
            <h2 className="text-lg font-black text-white">
              Gestion de mes chevaux
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-950/70 text-stone-300 hover:text-white hover:bg-emerald-900 transition"
          >
            ✕
          </button>
        </div>

        {/* Action bar: Add horse trigger */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-600">
            {horses.length} cheval(aux) enregistré(s) localement
          </span>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Ajouter un cheval</span>
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Add / Edit Form */}
          {isEditing && (
            <form onSubmit={handleSaveHorse} className="bg-stone-50 p-4 rounded-xl border border-stone-300 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-stone-900">
                  {editingHorseId ? 'Modifier la fiche du cheval' : 'Nouveau profil de cheval'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Annuler
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nom officiel *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Éclipse du Marais"
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Surnom / Écurie
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ex: Cloclo"
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Race / Type
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="Ex: Selle Français, Poney D..."
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Année de naissance
                  </label>
                  <input
                    type="number"
                    min="1980"
                    max="2030"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ex: 2016"
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Tempérament &amp; particularités
                </label>
                <input
                  type="text"
                  value={temperament}
                  onChange={(e) => setTemperament(e.target.value)}
                  placeholder="Ex: Énergique, sensible à la jambe gauche, calme en extérieur..."
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 text-xs">
                  Notes matérielles &amp; embouchure
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Ex: Mors olive 125 mm simple brisure, tapis dégarrotté fin, selle taille 17..."
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs outline-none focus:border-emerald-600 min-h-[60px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-700 hover:bg-stone-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}

          {/* Horses list */}
          {horses.length === 0 && !isEditing ? (
            <div className="text-center py-8 text-stone-500">
              <span className="text-3xl">🐴</span>
              <p className="mt-2 text-sm font-semibold text-stone-700">
                Aucun cheval enregistré pour l’instant
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Ajoutez votre premier cheval ou monture d’école pour associer vos séances d’entraînement et suivre son bien-être.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
              >
                + Enregistrer mon premier cheval
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {horses.map((horse) => (
                <div
                  key={horse.id}
                  className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center text-lg shrink-0">
                      🐴
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-stone-900">{horse.name}</h4>
                        {horse.nickname && (
                          <span className="text-xs text-stone-500 italic">
                            (« {horse.nickname} »)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5 space-x-2">
                        {horse.breed && <span>{horse.breed}</span>}
                        {horse.birthYear && <span>• Né(e) en {horse.birthYear}</span>}
                      </div>
                      {horse.temperament && (
                        <p className="text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded mt-1.5 inline-block">
                          Caractère : {horse.temperament}
                        </p>
                      )}
                      {horse.specialNotes && (
                        <p className="text-[11px] text-stone-600 mt-1">
                          Notes : {horse.specialNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(horse)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setHorseToDelete(horse)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {horseToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-stone-200 text-stone-900 space-y-3">
              <h3 className="font-bold text-base text-rose-900 flex items-center gap-2">
                <span>⚠️</span>
                <span>Confirmer la suppression</span>
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer la fiche de <strong>{horseToDelete.name}</strong> ?
              </p>
              <p className="text-[11px] text-stone-500 bg-stone-100 p-2.5 rounded-lg">
                ℹ️ Vos séances déjà enregistrées avec ce cheval ne seront pas effacées : son nom restera mentionné dans votre historique de séances.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setHorseToDelete(null)}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white font-medium text-xs hover:bg-stone-800 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

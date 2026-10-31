/** Navigation contextuelle : repérage des termes du dictionnaire dans un texte. */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findTerms } from '../components/ui/TermText.tsx';

describe('Termes cliquables', () => {
  it('repère les termes, accents et pluriels compris, une fois chacun', () => {
    const text = 'L’impulsion vient de l’arrière-main ; l’Impulsion n’est pas la vitesse. Les barres sont sensibles.';
    const found = findTerms(text);
    const ids = found.map((f) => f.id);
    assert.ok(ids.includes('term-impulsion'));
    assert.ok(ids.includes('term-arriere-main'));
    assert.ok(ids.includes('term-barres'));
    assert.equal(ids.filter((i) => i === 'term-impulsion').length, 1);
    const imp = found.find((f) => f.id === 'term-impulsion')!;
    assert.equal([...text].slice(imp.start, imp.end).join(''), 'impulsion');
    const barres = found.find((f) => f.id === 'term-barres')!;
    assert.equal([...text].slice(barres.start, barres.end).join(''), 'barres');
  });

  it('ne coupe pas un mot (pas de « pas » dans « passage »)', () => {
    assert.equal(findTerms('Le passage du coin').some((f) => f.id === 'term-pas'), false);
    assert.equal(findTerms('Au pas, le cheval').some((f) => f.id === 'term-pas'), false, 'formes de moins de 4 lettres ignorées');
  });

  it('préfère l’expression la plus longue', () => {
    const f = findTerms('Le siège en équilibre soulage le dos.');
    assert.ok(f.some((x) => x.id === 'term-siege-equilibre'));
  });
});

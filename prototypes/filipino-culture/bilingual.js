(function (root) {
  'use strict';
  // Visible translations stay directly below each Tagalog term, including in
  // dynamically rendered event titles, descriptions, and team requests.
  const glossary = {
    'Kain Tayo': 'Let’s eat',
    'Sama-sama': 'Together',
    'Bayanihan': 'Community cooperation',
    'Barkada': 'Circle of friends',
    'Pamilya': 'Family',
    'Likha': 'Creation',
    'Tuklas': 'Discovery',
    'Kalendaryo': 'Calendar',
    'Tara': 'Let’s go',
    'Alpas': 'Break free',
    'parol': 'Star lantern',
    'pancit': 'Noodle dish',
    'lumpia': 'Spring rolls'
  };
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
  const pattern = new RegExp('\\b(' + terms.join('|') + ')\\b', 'gi');
  function render(value) {
    const text = String(value);
    let output = '', previous = 0;
    for (const match of text.matchAll(pattern)) {
      const key = terms.find(term => term.toLowerCase() === match[0].toLowerCase());
      output += escape(text.slice(previous, match.index));
      output += `<span class="bilingual"><span lang="tl">${escape(match[0])}</span><span class="translation" lang="en">${escape(glossary[key])}</span></span>`;
      previous = match.index + match[0].length;
    }
    return output + escape(text.slice(previous));
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { glossary, render };
  else root.AlpasCopy = { glossary, render };
})(globalThis);

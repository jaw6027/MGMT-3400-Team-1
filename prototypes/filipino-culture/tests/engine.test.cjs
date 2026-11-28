const { test } = require('node:test');
const assert = require('node:assert/strict');
const { events, search, coversDate, runTests } = require('../engine.js');
const { collections } = require('../engine.js');
const { glossary, render } = require('../bilingual.js');

for (const result of runTests()) {
  test(result.name, () => assert.deepEqual(result.actual, [...result.expected].sort()));
}
test('canceled and unapproved records never reach discovery', () => {
  const ids = search().map(event => event.id);
  assert.ok(!ids.includes('B07'));
  assert.ok(!ids.includes('B08'));
});
test('an event ending exactly at midnight does not occupy the next day', () => {
  const event = { start: '2026-11-28T22:00:00-08:00', end: '2026-11-29T00:00:00-08:00' };
  assert.equal(coversDate(event, '2026-11-28'), true);
  assert.equal(coversDate(event, '2026-11-29'), false);
});
test('an overnight event ends at an exclusive boundary', () => {
  const event = events.find(event => event.id === 'B04');
  assert.equal(coversDate(event, '2026-11-28'), true);
  assert.equal(coversDate(event, '2026-11-29'), true);
  assert.equal(coversDate(event, '2026-11-30'), false);
});
test('a specific admission filter excludes unknown ages', () => {
  const result = search({ location: 'Bakersfield', date: '2026-11-28', age: 0 });
  assert.deepEqual(result.map(event => event.id), ['B01']);
});
test('sponsored matches appear first but do not create duplicates', () => {
  const result = search({ location: 'Bakersfield', date: '2026-11-28' });
  assert.equal(result[0].id, 'B03');
  assert.equal(result.length, new Set(result.map(event => event.id)).size);
});
test('time filter is inclusive and uses the event start, even on an overnight second day', () => {
  const ids = search({ location: 'Bakersfield', date: '2026-11-29', startHour: 19 }).map(event => event.id);
  assert.deepEqual(ids, ['B04']);
});
test('date and hour filtering do not depend on the computer time zone', () => {
  const previous = process.env.TZ;
  try {
    for (const zone of ['UTC', 'America/New_York', 'Asia/Manila']) {
      process.env.TZ = zone;
      assert.ok(runTests().every(result => result.passed), zone);
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('each cultural collection has a matching English glossary translation', () => {
  for (const collection of collections) assert.equal(glossary[collection.name], collection.meaning);
});
test('Tagalog words render with English directly beneath in a bilingual wrapper', () => {
  assert.match(render('Join the Barkada'), /<span class="bilingual"><span lang="tl">Barkada<\/span><span class="translation" lang="en">Circle of friends<\/span><\/span>/);
  assert.match(render('Kain Tayo: Food Market'), /lang="tl">Kain Tayo<\/span><span class="translation" lang="en">Let’s eat/);
  assert.match(render('Pamilya: Parol-Making'), /lang="en">Star lantern/);
});
test('translation covers repeated words and keeps user-entered markup escaped', () => {
  const markup = render('<img src=x onerror=alert(1)> BARKADA & barkada');
  assert.ok(!markup.includes('<img'));
  assert.ok(markup.includes('&lt;img'));
  assert.equal((markup.match(/Circle of friends/g) || []).length, 2);
  assert.ok(markup.includes('&amp;'));
});
test('approved cultural fixtures retain host, language, and context details', () => {
  for (const event of events.filter(event => event.approved)) {
    assert.ok(event.host && event.culturalNote && event.languages.length, event.id);
    for (const id of event.collections) assert.ok(collections.some(collection => collection.id === id), event.id);
  }
});

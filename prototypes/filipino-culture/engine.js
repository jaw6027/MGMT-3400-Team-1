(function (root) {
  'use strict';
  // Every fixture is fictional. Venue city and discovery region are separate.
  const fixtures = [
    { id: 'B01', title: 'Weekend Market & Bites', city: 'Bakersfield', region: 'Bakersfield', venue: 'Demo Market Square', start: '2026-11-28T09:00:00-08:00', end: '2026-11-28T13:00:00-08:00', price: 0, age: 0, interest: 'Food', moods: ['Exploring', 'Social'], status: 'scheduled', approved: true, sponsored: false, icon: '☀', theme: 'peach', description: 'A fictional open-air market with local makers, food stalls, and space to meet your neighbors.' },
    { id: 'B02', title: 'Clay & Conversation', city: 'Bakersfield', region: 'Bakersfield', venue: 'Demo Clay Studio', start: '2026-11-28T14:00:00-08:00', end: '2026-11-28T16:00:00-08:00', price: 25, age: 18, interest: 'Arts', moods: ['Creative', 'Social'], status: 'scheduled', approved: true, sponsored: false, icon: '✳', theme: 'lavender', description: 'Try a beginner pottery session and create something with your hands. Materials included in the fictional admission price.' },
    { id: 'B03', title: 'After Hours: Dance Social', city: 'Bakersfield', region: 'Bakersfield', venue: 'Demo Social Hall', start: '2026-11-28T19:00:00-08:00', end: '2026-11-28T23:00:00-08:00', price: 15, age: 18, interest: 'Music', moods: ['Dancing', 'Social'], status: 'scheduled', approved: true, sponsored: true, icon: '♫', theme: 'mint', description: 'An 18+ dance night with a beginner lesson and an open dance floor. Sponsorship does not override search filters.' },
    { id: 'B04', title: 'Midnight Groove', city: 'Bakersfield', region: 'Bakersfield', venue: 'Demo Night Lounge', start: '2026-11-28T22:00:00-08:00', end: '2026-11-29T02:00:00-08:00', price: 20, age: 21, interest: 'Music', moods: ['Dancing'], status: 'scheduled', approved: true, sponsored: false, icon: '☾', theme: 'lavender', description: 'A fictional late-night music event that continues into the next day. Admission is strictly 21+.' },
    { id: 'B05', title: 'Little Makers Afternoon', city: 'Bakersfield', region: 'Bakersfield', venue: 'Demo Community Room', start: '2026-11-29T13:00:00-08:00', end: '2026-11-29T15:00:00-08:00', price: 0, age: 0, interest: 'Family', moods: ['Family time', 'Creative'], status: 'scheduled', approved: true, sponsored: false, icon: '✿', theme: 'peach', description: 'A fictional family-friendly craft afternoon. Children attend with a caregiver.' },
    { id: 'B06', title: 'Sunset Soundcheck', city: 'Bakersfield', region: 'Bakersfield', venue: 'Demo Park Stage', start: '2026-11-28T17:00:00-08:00', end: '2026-11-28T18:00:00-08:00', price: null, age: null, interest: 'Music', moods: ['Relaxed'], status: 'scheduled', approved: true, sponsored: false, icon: '♪', theme: 'mint', description: 'A fictional performance with price and admission restrictions still unknown. Check with an organizer before attending.' },
    { id: 'B07', title: 'Canceled Park Concert', city: 'Bakersfield', region: 'Bakersfield', venue: 'Demo Park', start: '2026-11-28T19:00:00-08:00', end: '2026-11-28T21:00:00-08:00', price: 0, age: 0, interest: 'Music', moods: ['Relaxed'], status: 'canceled', approved: true },
    { id: 'B08', title: 'Unreviewed Art Fair', city: 'Bakersfield', region: 'Bakersfield', venue: 'Demo Gallery', start: '2026-11-28T10:00:00-08:00', end: '2026-11-28T12:00:00-08:00', price: 0, age: 0, interest: 'Arts', moods: ['Creative'], status: 'scheduled', approved: false },
    { id: 'O01', title: 'Coast & Coffee Walk', city: 'Huntington Beach', region: 'Orange County', venue: 'Demo Coastal Meeting Point', start: '2026-11-28T09:00:00-08:00', end: '2026-11-28T11:00:00-08:00', price: 0, age: 0, interest: 'Outdoors', moods: ['Relaxed', 'Exploring'], status: 'scheduled', approved: true, sponsored: false, icon: '≈', theme: 'mint', description: 'A fictional community walk by the coast. Coffee is optional and purchased separately.' },
    { id: 'O02', title: 'Downtown Dance Night', city: 'Santa Ana', region: 'Orange County', venue: 'Demo Dance Studio', start: '2026-11-28T19:00:00-08:00', end: '2026-11-28T22:00:00-08:00', price: 30, age: 18, interest: 'Music', moods: ['Dancing', 'Social'], status: 'scheduled', approved: true, sponsored: true, icon: '♫', theme: 'peach', description: 'A fictional evening of dancing in Santa Ana, discoverable through the broader Orange County region.' },
    { id: 'F01', title: 'Garden Sketch Club', city: 'Fresno', region: 'Fresno', venue: 'Demo Garden', start: '2026-11-28T10:00:00-08:00', end: '2026-11-28T12:00:00-08:00', price: 5, age: 0, interest: 'Arts', moods: ['Creative', 'Relaxed'], status: 'scheduled', approved: true, sponsored: false, icon: '✳', theme: 'mint', description: 'A fictional outdoor sketching meetup. Bring your own paper and pencils.' },
    { id: 'V01', title: 'Neighborhood Picnic', city: 'Visalia', region: 'Visalia', venue: 'Demo Picnic Lawn', start: '2026-11-29T12:00:00-08:00', end: '2026-11-29T14:00:00-08:00', price: 0, age: 0, interest: 'Family', moods: ['Family time', 'Social'], status: 'scheduled', approved: true, sponsored: false, icon: '☀', theme: 'peach', description: 'A fictional bring-your-own-lunch gathering for neighbors and families.' },
    { id: 'B09', title: 'Month-End Night Walk', city: 'Bakersfield', region: 'Bakersfield', venue: 'Demo Trailhead', start: '2026-11-30T23:00:00-08:00', end: '2026-12-01T01:00:00-08:00', price: 0, age: 18, interest: 'Outdoors', moods: ['Exploring'], status: 'scheduled', approved: true, sponsored: false, icon: '☾', theme: 'lavender', description: 'A fictional walk crossing a month boundary, included on both November 30 and December 1.' },
    { id: 'B10', title: 'Evening Music Workshop', city: 'Bakersfield', region: 'Bakersfield', venue: 'Demo Music Room', start: '2026-11-29T18:00:00-08:00', end: '2026-11-29T20:00:00-08:00', price: 10, age: 18, interest: 'Music', moods: ['Creative'], status: 'sold-out', approved: true, sponsored: false, icon: '♪', theme: 'lavender', description: 'A fictional sold-out workshop. It remains visible with its status clearly marked.' }
  ];
  // Collection names are editorial navigation, not labels applied to people.
  const collections = [
    { id: 'food', name: 'Kain Tayo', meaning: 'Let’s eat', description: 'Food markets & shared tables', symbol: '◒' },
    { id: 'friends', name: 'Barkada', meaning: 'Circle of friends', description: 'Music, dancing & meetups', symbol: '♫' },
    { id: 'family', name: 'Pamilya', meaning: 'Family', description: 'Activities across generations', symbol: '✿' },
    { id: 'arts', name: 'Likha', meaning: 'Creation', description: 'Workshops, art & storytelling', symbol: '✳' },
    { id: 'community', name: 'Bayanihan', meaning: 'Community cooperation', description: 'Volunteer & give back', symbol: '↗' }
  ];
  const culture = {
    B07: { title: 'Canceled Filipino Community Park Concert', collections: ['friends', 'arts'], host: 'Demo Filipino Music Collective', languages: ['English', 'Tagalog'], description: 'A fictional canceled community concert, retained to test that canceled events are excluded from discovery.', culturalNote: 'This fixture represents a canceled contemporary music gathering.' },
    B01: { title: 'Kain Tayo: Filipino Food Market', collections: ['food', 'friends'], host: 'Demo Filipino Food Collective', languages: ['English', 'Tagalog'], description: 'Explore fictional stalls serving pancit, lumpia, and plant-based dishes. Free admission; food purchases are separate.', culturalNote: 'Meet the cooks behind the dishes and ask about their own family recipes. Ingredients and regional styles vary; this market is one introduction, not a complete picture of Filipino food.' },
    B02: { title: 'Likha: Clay & Family Stories', collections: ['arts', 'friends'], host: 'Demo Filipino American Makers Circle', languages: ['English'], description: 'A fictional clay workshop led by a Filipino American artist. Shape a small piece inspired by a memory you want to share. Materials included.', culturalNote: 'The artist shares their personal creative practice. This workshop does not claim to teach a specific Indigenous pottery tradition.' },
    B03: { title: 'Barkada Beats: Filipino Pop Dance Social', collections: ['friends'], host: 'Demo Filipino Music Collective', languages: ['English', 'Tagalog'], description: 'A fictional 18+ social featuring Filipino pop playlists, a beginner dance warm-up, and room to meet new friends. Come with friends or on your own.', culturalNote: 'Contemporary Filipino music belongs alongside heritage activities in Alpas. This event is social dancing, not a traditional dance lesson.' },
    B04: { title: 'Barkada After Dark', collections: ['friends'], host: 'Demo Filipino Nightlife Collective', languages: ['English'], description: 'A fictional 21+ DJ night celebrating contemporary Filipino and diaspora artists. It continues into the next calendar day.', culturalNote: 'The event’s age restriction is specific to this venue. Nightlife is one optional experience among family, arts, food, and service gatherings.' },
    B05: { title: 'Pamilya: Parol-Making Afternoon', collections: ['family', 'arts'], host: 'Demo Filipino Family Arts Circle', languages: ['English', 'Tagalog'], description: 'Make a paper star lantern at a fictional family craft gathering. Materials are provided; children attend with a caregiver.', culturalNote: 'The host introduces the parol as a Filipino Christmas lantern and explains the seasonal context. Participation in the craft does not require religious observance.' },
    B06: { title: 'Filipino Songwriters at Sunset', collections: ['friends', 'arts'], host: 'Demo Filipino Songwriters Circle', languages: ['English', 'Tagalog'], description: 'A fictional acoustic set featuring original songs and artist stories. Price and admission restrictions remain unconfirmed.', culturalNote: 'Artists introduce the language and meaning of their own songs; English and Tagalog do not represent every language spoken in the Philippines.' },
    O01: { title: 'Barkada Coastal Walk', collections: ['friends'], host: 'Demo Filipino Outdoors Circle', languages: ['English'], description: 'A fictional, easygoing coastal meetup hosted by a Filipino community group. All backgrounds are welcome. Optional refreshments cost extra.', culturalNote: 'This is a contemporary community meetup, not a heritage ceremony. Hosting context is shown so people know who they are gathering with.' },
    O02: { title: 'Barkada Beats: Santa Ana', collections: ['friends'], host: 'Demo Filipino Music Collective', languages: ['English', 'Tagalog'], description: 'A fictional 18+ Filipino pop dance social in Santa Ana. Join with friends or meet someone new; no dance experience required.', culturalNote: 'A contemporary music gathering, with music credits and artist introductions proposed for the live event listing.' },
    F01: { title: 'Likha: Filipino American Sketch Circle', collections: ['arts'], host: 'Demo Fresno Filipino American Artists', languages: ['English'], description: 'A fictional sketching meetup with Filipino American artists sharing everyday stories through drawing. Bring paper and pencils.', culturalNote: 'Each artist speaks from their own experience. The session welcomes different relationships to Filipino heritage and identity.' },
    V01: { title: 'Pamilya Community Picnic', collections: ['family', 'food'], host: 'Demo Visalia Filipino Community Circle', languages: ['English', 'Tagalog'], description: 'A fictional bring-your-own-lunch picnic for families, friends, and neighbors. Join a shared table or bring your own blanket.', culturalNote: 'Gathering and sharing stories are the focus. No one needs Filipino ancestry or Tagalog fluency to take part.' },
    B09: { title: 'Barkada Under the Stars', collections: ['friends'], host: 'Demo Filipino Outdoors Circle', languages: ['English'], description: 'A fictional late-night community walk crossing from November into December. Exact route and accessibility details would require host confirmation.', culturalNote: 'An outdoor meetup hosted by a Filipino community group; no cultural ritual or heritage practice is implied.' },
    B10: { title: 'Likha: Filipino Songwriting Circle', collections: ['arts', 'friends'], host: 'Demo Filipino Songwriters Circle', languages: ['English', 'Tagalog'], description: 'A fictional sold-out workshop about writing songs from personal and family stories. The listing stays visible with its sold-out status.', culturalNote: 'Participants choose the language of their own lyrics. A production listing should specify the host’s teaching and translation support.' }
  };
  const events = fixtures.map(event => ({ ...event, collections: [], ...culture[event.id] }));
  events.push({ id: 'V02', title: 'Bayanihan: Neighborhood Care Day', city: 'Visalia', region: 'Visalia', venue: 'Demo Community Garden', start: '2026-11-29T09:00:00-08:00', end: '2026-11-29T11:00:00-08:00', price: 0, age: 0, interest: 'Community', moods: ['Social'], collections: ['community'], host: 'Demo Filipino Volunteer Circle', languages: ['English', 'Tagalog'], status: 'scheduled', approved: true, sponsored: false, icon: '↗', theme: 'mint', description: 'Join a fictional neighborhood cleanup and garden care morning. Supplies are provided; minors attend with a caregiver. Participation is free.', culturalNote: 'This collection draws on community cooperation. The local host defines the actual work, available tasks, and participation needs.' });
  const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' });
  function localDate(value) { return dateFormatter.format(new Date(value)); }
  function localHour(value) { return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', hourCycle: 'h23' }).format(new Date(value))); }
  function coversDate(event, date) {
    // End is exclusive: an event ending exactly at midnight is absent next day.
    return localDate(event.start) <= date && localDate(new Date(new Date(event.end).getTime() - 1)) >= date;
  }
  function search(filters = {}, source = events) {
    return source.filter(event => {
      if (!event.approved || !['scheduled', 'sold-out'].includes(event.status)) return false;
      if (filters.location && event.region !== filters.location && event.city !== filters.location) return false;
      if (filters.date && !coversDate(event, filters.date)) return false;
      if (filters.month && !filters.date) {
        const startMonth = localDate(event.start).slice(0, 7);
        const endMonth = localDate(new Date(new Date(event.end).getTime() - 1)).slice(0, 7);
        if (startMonth > filters.month || endMonth < filters.month) return false;
      }
      if (filters.age !== undefined && filters.age !== '' && (event.age === null || event.age !== Number(filters.age))) return false;
      if (filters.maxPrice !== undefined && filters.maxPrice !== '' && (event.price === null || event.price > Number(filters.maxPrice))) return false;
      if (filters.startHour !== undefined && filters.startHour !== '' && localHour(event.start) < Number(filters.startHour)) return false;
      if (filters.mood && !event.moods.includes(filters.mood)) return false;
      if (filters.interest && event.interest !== filters.interest) return false;
      if (filters.collection && !event.collections.includes(filters.collection)) return false;
      return true;
    }).sort((a, b) => Number(Boolean(b.sponsored)) - Number(Boolean(a.sponsored)) || a.start.localeCompare(b.start) || a.id.localeCompare(b.id));
  }
  const cases = [
    { name: 'Bakersfield • Nov 28', filters: { location: 'Bakersfield', date: '2026-11-28' }, expected: ['B01', 'B02', 'B03', 'B04', 'B06'] },
    { name: 'Switch to Orange County', filters: { location: 'Orange County', date: '2026-11-28' }, expected: ['O01', 'O02'] },
    { name: 'Different date • Nov 29', filters: { location: 'Bakersfield', date: '2026-11-29' }, expected: ['B04', 'B05', 'B10'] },
    { name: 'Free only • excludes unknown prices', filters: { location: 'Bakersfield', date: '2026-11-28', maxPrice: 0 }, expected: ['B01'] },
    { name: '$15 ceiling includes $15', filters: { location: 'Bakersfield', date: '2026-11-28', maxPrice: 15 }, expected: ['B01', 'B03'] },
    { name: '18+ dancing • starts at/after 7 PM', filters: { location: 'Bakersfield', date: '2026-11-28', age: 18, mood: 'Dancing', startHour: 19 }, expected: ['B03'] },
    { name: '21+ restriction stays separate', filters: { location: 'Bakersfield', date: '2026-11-28', age: 21 }, expected: ['B04'] },
    { name: 'All-ages family activity', filters: { location: 'Bakersfield', date: '2026-11-29', age: 0, mood: 'Family time', maxPrice: 0 }, expected: ['B05'] },
    { name: 'Arts interest', filters: { location: 'Bakersfield', date: '2026-11-28', interest: 'Arts' }, expected: ['B02'] },
    { name: 'Overnight event on second date', filters: { location: 'Bakersfield', date: '2026-11-29', mood: 'Dancing' }, expected: ['B04'] },
    { name: 'No matching events', filters: { location: 'Visalia', date: '2026-11-28' }, expected: [] },
    { name: 'Month boundary • December', filters: { location: 'Bakersfield', month: '2026-12' }, expected: ['B09'] },
    { name: 'Fresno location', filters: { location: 'Fresno', date: '2026-11-28' }, expected: ['F01'] },
    { name: 'Visalia location', filters: { location: 'Visalia', date: '2026-11-29' }, expected: ['V01', 'V02'] },
    { name: 'Kain Tayo • free food-market admission', filters: { location: 'Bakersfield', date: '2026-11-28', collection: 'food', maxPrice: 0 }, expected: ['B01'] },
    { name: 'Likha • arts collection crosses interests', filters: { location: 'Bakersfield', date: '2026-11-29', collection: 'arts' }, expected: ['B05', 'B10'] },
    { name: 'Bayanihan • community care', filters: { location: 'Visalia', date: '2026-11-29', collection: 'community', maxPrice: 0 }, expected: ['V02'] },
    { name: 'Collection and age filters combine', filters: { location: 'Bakersfield', date: '2026-11-28', collection: 'friends', age: 18 }, expected: ['B02', 'B03'] },
    { name: 'No leakage from sponsored listing', filters: { location: 'Bakersfield', date: '2026-11-28', maxPrice: 0, mood: 'Dancing' }, expected: [] }
  ];
  function runTests() {
    return cases.map(test => {
      const actual = search(test.filters).map(event => event.id).sort();
      return { ...test, actual, passed: JSON.stringify(actual) === JSON.stringify([...test.expected].sort()) };
    });
  }
  const api = { events, collections, search, coversDate, localDate, cases, runTests };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Alpas = api;
})(globalThis);

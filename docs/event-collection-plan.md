# Alpas event collection and verification plan

Alpas helps people discover local experiences through a calendar, location selection, and filters for age, time, interests, and mood. This plan defines an initial event collection for the team to build and test those features, with a review process to keep published information accurate.

The examples below are event types to collect, not confirmed upcoming events. Listing counts are proposed targets, not events already gathered. The calendar and shared verification queue are proposed features; this plan does not implement them or change the current prototype.

## Collection targets

Start with 40–60 verified event records across the pilot areas to develop the calendar, event details, and combined filters. Expand toward 400 scheduled occurrences across Bakersfield, Orange County, Fresno, and Visalia over a rolling 60-day period.

Count each scheduled occurrence as a listing. Link occurrences of a recurring event to the same series, and avoid counting duplicate listings from different sources.

### Bakersfield and Orange County

These targets are combined across the two areas.

| Category | Target listings | Event types to collect | Possible mood tags |
| --- | ---: | --- | --- |
| Markets and food | 30 | Farmers markets, food truck nights, craft markets | Hungry, exploring, social |
| Music and performances | 30 | Local bands, theater, comedy, outdoor concerts | Live entertainment, date night |
| Outdoors and recreation | 30 | Guided hikes, bike rides, nature walks | Adventurous, active, relaxed |
| Arts and learning | 25 | Pottery classes, museum programs, photography walks | Creative, curious |
| Family activities | 25 | Storytime, children's workshops, family movie nights | Family time, playful |
| Nightlife and dancing | 20 | Dance nights, karaoke, trivia, DJ events | Dancing, party, social |
| Community and culture | 20 | Cultural festivals, neighborhood fairs, volunteering | Exploring, connecting, giving back |
| Sports and games | 20 | Local games, tournaments, board game meetups | Competitive, active, social |
| Total | 200 | | |

### Fresno and Visalia

Collect 100 listings per city. Nearby communities may be included through a distance search, but retain the actual city for every venue.

| Category | Fresno examples | Visalia examples | Target per city | Mood tags |
| --- | --- | --- | ---: | --- |
| Markets and food | Farmers markets, food truck gatherings, food festivals, tastings | Farmers markets, downtown food walks, craft markets, food truck nights | 15 | Hungry, exploring, social |
| Music and performances | Local concerts, theater, comedy, open mic nights | Live music, symphony performances, community theater, outdoor concerts | 15 | Live entertainment, date night |
| Outdoors and recreation | Guided nature walks, group cycling, birdwatching, outdoor fitness | Guided hikes, nature walks, group cycling, stargazing in nearby communities | 15 | Adventurous, active, relaxed |
| Arts and learning | Art walks, gallery openings, pottery, cooking workshops | Art exhibitions, painting workshops, photography walks, craft classes | 15 | Creative, curious |
| Family activities | Storytime, science workshops, family movies, holiday celebrations | Children's crafts, park activities, family performances, seasonal celebrations | 15 | Family time, playful |
| Nightlife and dancing | DJ nights, karaoke, salsa lessons, themed dance parties | Karaoke, trivia, live-band dancing, themed parties | 10 | Dancing, party, social |
| Community and culture | Cultural festivals, neighborhood fairs, volunteering, community celebrations | Downtown festivals, cultural celebrations, parades, community cleanups | 10 | Connecting, exploring, giving back |
| Sports and games | Baseball, college sports, fun runs, board game tournaments | Baseball, recreational tournaments, charity runs, game nights | 5 | Competitive, active, social |
| Total | 100 Fresno listings | 100 Visalia listings | 100 | |

Across the collection, include free and paid options, weekdays and weekends, different times of day, indoor and outdoor activities, and options for individuals, dates, friends, and families. Record admission restrictions separately from suitability: all ages, 18+, and 21+ describe entry requirements; family-friendly describes suitability. An unknown restriction should stay unknown until checked.

## Regional expansion

Fresno and Visalia are north of Bakersfield. Coverage from Fresno to Orange County spans several regions and travel routes.

The following is an alternative geographic allocation for a later regional collection. It is not an additional 380 listings to add to the 400-listing pilot target.

| Area | Cities to consider | Proposed listings over 60 days |
| --- | --- | ---: |
| Fresno area | Fresno, Clovis | 60 |
| Visalia and surrounding communities | Visalia, Tulare, Hanford, Exeter, Porterville | 60 |
| Bakersfield and nearby communities | Bakersfield, Delano, Shafter, Tehachapi | 60 |
| Santa Clarita and northern Los Angeles County | Santa Clarita, Lancaster, Palmdale | 40 |
| Los Angeles area | Los Angeles, Burbank, Glendale, Pasadena, Long Beach | 80 |
| Orange County | Anaheim, Santa Ana, Irvine, Fullerton, Costa Mesa, Huntington Beach | 80 |
| Total | | 380 |

Support city and distance searches, such as Visalia within 25 miles, and allow users to explore farther away. Store the actual venue city separately from its broader region and the website that supplied the listing. A Three Rivers event found on a Visalia tourism calendar belongs at its actual location.

## Event record fields

| Field group | Information to record |
| --- | --- |
| Basic information | Stable event ID, title, description, category, organizer |
| Schedule | Start and end dates and times, time zone, recurring-series ID when relevant |
| Location | Venue, address, actual city, region, coordinates |
| Price and booking | Free or paid, price or range, currency, known fees, ticket or registration URL; preserve unknown prices |
| Discovery filters | Minimum age, family-friendly designation, interests, mood tags, indoor or outdoor |
| Visitor details | Confirmed accessibility information, parking, registration requirements |
| Sources and review | Source URL, source event ID when available, last checked date, reviewer, approval status |
| Event status | Scheduled, canceled, postponed, or sold out; history of changes |
| Promotion | Sponsored status and promotion dates |

Mood tags can overlap. An event can be creative, social, and suitable for a date. Sponsored placement should remain identifiable and should not bypass verification.

## Collection sources

Use tourism and city calendars to discover events, then confirm details with the organizer or venue before publishing.

| Area | Starting sources |
| --- | --- |
| Bakersfield | [Visit Bakersfield](https://www.visitbakersfield.com/events/), [City of Bakersfield](https://www.bakersfieldcity.us/calendar-of-events) |
| Orange County | [OC Parks](https://parks.oc.gov/events), individual city and organizer calendars |
| Fresno | [Visit Fresno County](https://www.visitfresnocounty.org/events/calendar-of-events/) |
| Visalia | [Visit Visalia](https://www.visitvisalia.com/calendar) |

Begin with source links and outbound booking links. Proposed ticketing and promotional partnerships are future business opportunities, not existing agreements.

## Verification workflow

1. Collect an event from a source or receive an organizer submission.
2. Flag missing details, dates that have passed, and possible duplicates using title, venue, and start time.
3. Have a teammate check the organizer's source and record who verified the information and when.
4. Publish approved events to the public calendar.
5. Recheck listings and apply confirmed cancellations, postponements, reschedules, and sold-out notices, retaining a history of the changes.

Keep review status separate from event status. An approved event may later be canceled. Give each occurrence of a recurring event its own schedule and status so canceling one occurrence does not cancel the entire series.

## Test records and acceptance checks

Maintain about 20 clearly labeled fictional records separately from verified public listings. Include duplicates, missing venues, dates that have passed, cancellations, reschedules, overnight events, recurring events, sold-out events, unknown prices, and different age restrictions.

The proposed workflow is ready for a prototype demonstration when:

- A user can choose a date and location, apply age, price, interest, mood, and time filters, and view matching approved events.
- Common searches produce useful options, such as a free family activity this weekend, an evening date idea, and a 21+ dancing event.
- Organizers can submit listings, and reviewers can resolve incomplete, duplicate, or outdated information.
- A verified cancellation updates the public calendar and records who verified it.
- Recurring and overnight events appear on the appropriate dates without duplicate source listings.
- Fictional test records remain distinguishable from real verified events.

Two hundred listings across Fresno and Visalia are sufficient for an initial class prototype; the broader 400-listing target provides more variety across four areas. A public launch will require continuing collection and verification as events pass or change.

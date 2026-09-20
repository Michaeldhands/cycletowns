/* The English message catalogue.

   Every user-facing string the interface writes itself belongs here, so a translator gets one
   file instead of sixty-four, and so a missing translation is a type error rather than a
   sentence in the wrong language shipped to a reader.

   What does NOT belong here: content. Town blurbs, café notes, event descriptions and
   articles live in the database and are translated through the `translations` table — see
   migration 0020 and I18N.md. The line is "did an author write it, or did the interface?"

   Keys are dotted and grouped by surface. Values with {placeholders} take arguments through
   t() — never build a sentence by concatenating fragments, because word order differs by
   language and the fragments become untranslatable.
*/

export const en = {
  nav: {
    towns: "Towns",
    rankings: "Rankings",
    routes: "Route planner",
    events: "Events",
    news: "News",
    feed: "Feed",
    shop: "Shop",
    membership: "Membership",
    partners: "Partners",
    saved: "Saved",
    planTrip: "Plan a trip",
    signIn: "Sign in",
    joinFree: "Join free",
    account: "Account",
    menu: "Menu",
    openMenu: "Open menu",
    home: "Cycletowns home",
    planMyTrip: "Plan my trip",
    logIn: "Log in",
    allTowns: "All towns",
    rewards: "Rewards",
    getStarted: "Get started",
    close: "Close",
    back: "Back",
  },

  footer: {
    tagline: "Every town ranked by the riders who actually rode it.",
    explore: "Explore",
    riders: "Riders",
    business: "For business",
    company: "Company",
    legal: "Legal",
    newsletter: "Get it in your inbox.",
    newsletterSub: "Town guides, events and what's new — no more than monthly.",
    rights: "All rights reserved.",
    entity: "Cycletowns is operated by Sport2040 Pty Ltd",
  },

  home: {
    heroLede: "The world's best {brand} — researched by us, then ranked by the riders who've been there.",
    whatsYourRide: "What's your ride?",
    howYouRide: "How do you ride?",
    topRanked: "Top ranked",
    bestCycletowns: "The world's best Cycletowns",
    twoWays: "Two ways to roll",
    getTheMost: "Get the most out of Cycletowns",
    newsKicker: "The hub · Originals",
    newsTitle: "Cycletowns News",
    newsLede: "Town guides, route guides and features, written by the Cycletowns team.",
  },

  rankings: {
    kicker: "Global rankings",
    title: "{total} Cycletowns · {ranked} ranked",
    showMe: "Show me:",
    cycletown: "Cycletown",
    knownFor: "Known for",
    editorial: "Editorial",
    riders: "Riders",
    rankedOn: "Ranked on",
    why: "Why?",
    hide: "Hide",
    onTheRadar: "On the radar",
    inProgress: "In progress",
    notYetRated: "not yet rated",
    preview: "Preview",
    view: "View",
    reviewCta: "Ridden {town}? Add your score",
    keyEditorial: "Our own score, from published route, café and safety research.",
    keyRiders:
      "Built from riders' published reviews, weighted towards recent and ride-verified ones. It replaces the editorial score at {threshold} reviews, and that is the score a town is ranked on.",
  },

  town: {
    rankedCycletown: "#{rank} ranked Cycletown",
    ranked: "#{rank} ranked",
    editorialScore: "{score} editorial",
    ridersScore: "{score} riders · {reviews}",
    ridersPending: "riders — {count} of {threshold} reviews",
    planTripHere: "Plan my trip here",
    buildLoop: "Build a loop",
    topRides: "Top rides",
    bestCafes: "Best café stops",
    bikeShops: "Bike shops & hire",
    thingsToDo: "Things to do in {town}",
    riderReviews: "Rider reviews",
    noReviews: "No reviews yet — be the first to rate {town}. The first {threshold} reviews switch the score from editorial to rider-built.",
    whySits: "Why {town} sits at #{rank}",
    moreNearby: "More Cycletowns nearby",
    guideInProgress: "Guide in progress",
    stockPhotoNote: "Stock riding photo — not {town}. A real one comes with the guide.",
  },

  plan: {
    where: "Where are you riding?",
    chooseTown: "Choose a town…",
    arriving: "Arriving (optional)",
    howManyDays: "How many days?",
    howDoYouRide: "How do you ride?",
    whatFor: "What are you here for?",
    bike: "Bike",
    bringingOwn: "Bringing my own",
    hiringThere: "Hiring there",
    build: "Build my plan",
    buildDisabled: "Choose a town above to build your plan",
    yourPlan: "Your {town} plan",
    rebuilds: "Adjust anything above and it rebuilds instantly.",
    print: "Print",
    save: "Save this plan",
    saving: "Saving…",
    saved: "Saved",
    joinToSave: "Join free to save it",
    whatYouGet: "What you'll get",
  },

  loop: {
    kicker: "Route planner",
    title: "Build your own loop.",
    town: "Town",
    startPoint: "Start point",
    yourPin: "your pin",
    townCentre: "town centre",
    clickMap: "Click the map to start somewhere else — your accommodation, a car park, the café you always meet at.",
    resetStart: "Reset to town centre",
    howFar: "How far?",
    whatRiding: "What are you riding?",
    build: "Build my loop",
    buildDisabled: "Choose a town above to build a loop",
    building: "Finding roads…",
    another: "Build another",
    reroll: "Different loop, same distance",
    distance: "Distance",
    climbing: "Climbing",
    yourTime: "Your time",
    grade: "Grade",
    paceLabel: "At {speed} km/h on the flat",
    paceDefault: " — the usual pace for this kind of riding",
    capNote: "Loops are capped at {max} km — that's the limit of the routing service we use.",
    notSwitchedOn: "Route building isn't switched on yet — it needs the routing service connected. Everything else on the site works as normal.",
  },

  reviews: {
    rate: "Rate {town}",
    update: "Update your review",
    verifyRide: "Verify your ride",
    rideVerified: "Ride verified",
    connectStrava: "Connect Strava",
    checkRides: "Check my rides",
    checking: "Checking your rides…",
    poweredByStrava: "Powered by Strava",
  },

  partners: {
    kicker: "For partners",
    title: "Run a business riders love?",
    enquire: "Enquire",
    businessName: "Business name",
    yourName: "Your name",
    email: "Email",
    message: "What you're hoping to get out of it.",
    send: "Send enquiry",
    sending: "Sending…",
    sent: "Thanks — we'll be in touch within one business day.",
    noSpam: "No spam. A real human replies within one business day",
  },

  common: {
    loading: "Loading…",
    tryAgain: "Something went wrong — try again.",
    somethingWrong: "Something went wrong.",
    seeAll: "See all",
    readMore: "Read more",
    openInMaps: "Open in Google Maps",
    viewRoute: "View route on map",
    verifiedBikeFriendly: "Verified bike-friendly",
  },
} as const;

/** The shape every other locale must satisfy. A missing key will not compile. */
export type Messages = typeof en;
export default en;

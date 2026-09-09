-- One fabricated article survived migration 0018.
--
-- 0018 deleted by an exact list of slugs that I typed out by hand, and I got one wrong:
-- "Australia’s" slugifies to `australia-s`, not `australias`, because the apostrophe is a
-- non-alphanumeric and becomes a separator. So
--
--   town-in-focus-bright-inside-australia-s-alpine-cycling-heart
--
-- was never matched, and "Town in Focus: Bright — Ep 2" stayed published alongside its
-- honest replacement. The audit endpoint counted 6 articles where there should have been 5,
-- and the text pattern for a claimed correspondent didn't catch it either — the body says
-- "Our Asia correspondent Kenji Mori", with a word between "our" and "correspondent".
--
-- Matching on structure rather than on typed strings this time. Every fabricated piece was
-- part of the "Town in Focus" series, so that is the thing to delete, and no honest article
-- carries a series or episode any more.

delete from articles
where series is not null
   or episode is not null
   or slug like 'town-in-focus-%'
   or body ilike '%correspondent%';

-- Belt and braces: no honest article should carry these, so if one ever does it is a mistake.
update articles set series = null, episode = null where series is not null or episode is not null;

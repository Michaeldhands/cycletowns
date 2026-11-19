-- 0028 · Retire rewards.
-- Points, tiers and the Insider multiplier made an independent guide look like a loyalty scheme.
-- Reviews and posts no longer earn points. Existing balances are left in place (nothing reads
-- them any more) so this is reversible; nothing is deleted.
drop trigger if exists reviews_award on reviews;
drop trigger if exists posts_award on posts;
select 'rewards retired' as done;

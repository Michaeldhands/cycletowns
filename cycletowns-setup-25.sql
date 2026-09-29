-- L'Eroica: a photograph of the event itself, supplied directly rather than from Wikimedia Commons.
-- Served from the site's own /img/events folder. Overwrites whatever image the event had.
update events set img = 'https://cycletowns.com/img/events/leroica.jpg' where slug = 'leroica';

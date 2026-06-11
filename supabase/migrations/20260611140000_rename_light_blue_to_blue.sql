-- Rename "Love Key Guardian - Light Blue" to "Love Key Guardian - Blue" across all rows.
UPDATE public.route_catalogue
SET title = REPLACE(title, 'Love Key Guardian - Light Blue', 'Love Key Guardian - Blue')
WHERE title LIKE '%Light Blue%';

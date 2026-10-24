-- UX-P08.5: compact learner-facing station labels.
-- This is a label refinement only; it does not change station ordering or learning truth.
update public.stations set title = 'جایگاه و جهت' where code = 'G1-ST02';
update public.stations set title = 'شکل‌ها و ویژگی‌ها' where code = 'G1-ST04';
update public.stations set title = 'جمع با مهره‌ها' where code = 'G1-ST06';
update public.stations set title = 'برابری و عدد ۸' where code = 'G1-ST11';
update public.stations set title = 'مقایسه و عدد ۹' where code = 'G1-ST12';
update public.stations set title = 'نشانهٔ جمع' where code = 'G1-ST13';
update public.stations set title = 'عددهای ۱ تا ۱۰۰' where code = 'G1-ST21';
update public.stations set title = 'تقویم و شمارش' where code = 'G1-ST22';
update public.stations set title = 'مسئله‌های چندمرحله‌ای' where code = 'G1-ST24';

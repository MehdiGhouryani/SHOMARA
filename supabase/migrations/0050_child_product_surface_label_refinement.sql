-- UX-P07.5 refinement: final learner-facing station labels.
-- This intentionally supersedes the P07.5 initial wording in 0049 without
-- rewriting migration history.

update public.stations
set title = case code
  when 'G1-ST01' then 'شمارش و الگو'
  when 'G1-ST02' then 'جایگاه و جهت'
  when 'G1-ST03' then 'عدد و جمع'
  when 'G1-ST04' then 'شکل‌ها و ویژگی‌ها'
  when 'G1-ST05' then 'جمع و تفریق'
  else title
end
where code in ('G1-ST01', 'G1-ST02', 'G1-ST03', 'G1-ST04', 'G1-ST05');

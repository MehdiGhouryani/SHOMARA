-- UX-P07.5: learner-facing station labels.
-- Historical curriculum/source documents retain their original titles. This
-- migration changes only the active station records used by the child product.

update public.stations
set title = case code
  when 'G1-ST01' then 'شمارش و الگو'
  when 'G1-ST02' then 'جایگاه و جهت'
  when 'G1-ST03' then 'ساخت عدد و جمع'
  when 'G1-ST04' then 'دنیای شکل‌ها'
  when 'G1-ST05' then 'جمع و تفریق'
  else title
end
where code in ('G1-ST01', 'G1-ST02', 'G1-ST03', 'G1-ST04', 'G1-ST05');

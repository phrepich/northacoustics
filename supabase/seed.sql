insert into public.clients (
  id,
  name,
  company_rut,
  address,
  contact_name,
  contact_email,
  phone,
  notes
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Forestal Santa Aurora SpA',
  '76.512.430-1',
  'Camino Industrial 1450, Coronel',
  'Patricio Mella',
  'pmella@santaaurora.cl',
  '+56 41 245 8811',
  'Cliente recurrente para campañas de ruido industrial.'
)
on conflict (id) do nothing;


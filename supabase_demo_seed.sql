-- ─────────────────────────────────────────────────────────────────────────────
-- PharmStable — demo account seed data
-- Generated from the real calculateStability() algorithm. Safe to re-run.
--
-- PREREQUISITE: create the demo user first (Dashboard → Authentication → Users →
-- Add user → email below, with "Auto Confirm User" CHECKED), and make sure
-- supabase_setup.sql (+ supabase_fix_history.sql) have been applied.
--
-- If you used a different email, find/replace 'demo@pharmstable.app' below.
-- ─────────────────────────────────────────────────────────────────────────────

-- 0. Fail fast with a friendly message if the demo user doesn't exist yet.
do $$
begin
  if not exists (select 1 from auth.users where email = 'demo@pharmstable.app') then
    raise exception 'Demo user demo@pharmstable.app not found. Create it first in Authentication → Users (Add user, with Auto Confirm User checked).';
  end if;
end $$;

-- 1. Make sure the demo user has a profiles row (harmless if it already exists).
insert into public.profiles (id, email)
select id, email from auth.users where email = 'demo@pharmstable.app'
on conflict (id) do nothing;

-- 2. Clear any previous demo analyses so re-running stays idempotent.
delete from public.analyses
where user_id = (select id from auth.users where email = 'demo@pharmstable.app');

-- 3. Seed three analyses (green / amber / red spread).

-- Amoxicillin: 48% (possibly_degraded)
insert into public.analyses (user_id, drug_name, smiles, input_data, result_data, created_at)
values (
  (select id from auth.users where email = 'demo@pharmstable.app'),
  'Amoxicillin',
  'CC1(C)SC2C(NC(=O)C(N)c3ccc(O)cc3)C(=O)N2C1C(O)=O',
  $json${"stabilityClass":3,"formulation":"capsule","expiryDate":"2025-08-15","manufacturingDate":"","storageTemp":25,"storageHumidity":55,"lightExposure":"none","containerIntegrity":"opened","strength":"500 mg","manufacturer":"GSK","notes":"Clinic storeroom stock; bottle opened after first dispensing."}$json$::jsonb,
  $json${"verdict":"possibly_degraded","probability":48,"factors":[{"name":"Time Since Expiry","impact":-34,"description":"10 months past expiry (34 point penalty, class multiplier: 1x)"},{"name":"Storage Temperature","impact":0,"description":"25°C — within recommended range"},{"name":"Relative Humidity","impact":-6,"description":"55% RH — moisture exposure risk"},{"name":"Light Exposure","impact":0,"description":"No significant light exposure"},{"name":"Container Integrity","impact":-10,"description":"Container opened — exposure to air, moisture, and contaminants"},{"name":"Formulation Type","impact":-2,"description":"capsule formulation — minor stability consideration"}],"riskLevel":"medium","summary":"Amoxicillin is estimated to be possibly degraded with reduced efficacy with a 48% probability of retained activity. The drug is 10 months past its expiry date. The most significant degradation factor is time since expiry. Note: This is a heuristic estimate for research purposes only. Always consult a pharmacist or physician before using any medication past its expiry date.","monthsSinceExpiry":10}$json$::jsonb,
  now() - interval '1 hour'
);

-- Ibuprofen: 95% (likely_active)
insert into public.analyses (user_id, drug_name, smiles, input_data, result_data, created_at)
values (
  (select id from auth.users where email = 'demo@pharmstable.app'),
  'Ibuprofen',
  'CC(C)Cc1ccc(cc1)C(C)C(O)=O',
  $json${"stabilityClass":1,"formulation":"tablet","expiryDate":"2026-03-15","manufacturingDate":"","storageTemp":22,"storageHumidity":40,"lightExposure":"none","containerIntegrity":"sealed","strength":"200 mg","manufacturer":"Pfizer","notes":"Sealed blister pack, climate-controlled pharmacy."}$json$::jsonb,
  $json${"verdict":"likely_active","probability":95,"factors":[{"name":"Time Since Expiry","impact":-5,"description":"3 months past expiry (5 point penalty, class multiplier: 0.5x)"},{"name":"Storage Temperature","impact":0,"description":"22°C — within recommended range"},{"name":"Relative Humidity","impact":0,"description":"40% RH — acceptable"},{"name":"Light Exposure","impact":0,"description":"No significant light exposure"},{"name":"Container Integrity","impact":0,"description":"Container sealed and intact"}],"riskLevel":"low","summary":"Ibuprofen is estimated to be likely still biologically active with a 95% probability of retained activity. The drug is 3 months past its expiry date. The most significant degradation factor is time since expiry. Note: This is a heuristic estimate for research purposes only. Always consult a pharmacist or physician before using any medication past its expiry date.","monthsSinceExpiry":3}$json$::jsonb,
  now() - interval '1 day'
);

-- Tetracycline: 0% (likely_inactive)
insert into public.analyses (user_id, drug_name, smiles, input_data, result_data, created_at)
values (
  (select id from auth.users where email = 'demo@pharmstable.app'),
  'Tetracycline',
  'CN(C)C1C(O)=C(C(N)=O)C(=O)C2(O)C(O)=C3C(=O)c4c(O)cccc4C(O)C3CC12',
  $json${"stabilityClass":4,"formulation":"capsule","expiryDate":"2023-06-15","manufacturingDate":"","storageTemp":35,"storageHumidity":80,"lightExposure":"indirect","containerIntegrity":"opened","strength":"250 mg","manufacturer":"Teva","notes":"Old field-kit stock; stored through a hot, humid summer."}$json$::jsonb,
  $json${"verdict":"likely_inactive","probability":0,"factors":[{"name":"Time Since Expiry","impact":-243,"description":"36 months past expiry (243 point penalty, class multiplier: 1.5x)"},{"name":"Storage Temperature","impact":-20,"description":"35°C — significantly outside optimal range"},{"name":"Relative Humidity","impact":-24,"description":"80% RH — moisture exposure risk"},{"name":"Light Exposure","impact":-5,"description":"Indirect light — photodegradation risk"},{"name":"Container Integrity","impact":-10,"description":"Container opened — exposure to air, moisture, and contaminants"},{"name":"Formulation Type","impact":-2,"description":"capsule formulation — minor stability consideration"}],"riskLevel":"high","summary":"Tetracycline is estimated to be likely inactive or significantly degraded with a 0% probability of retained activity. The drug is 36 months past its expiry date. The most significant degradation factor is time since expiry. Note: This is a heuristic estimate for research purposes only. Always consult a pharmacist or physician before using any medication past its expiry date.","monthsSinceExpiry":36}$json$::jsonb,
  now() - interval '3 days'
);

-- 4. Verify.
select drug_name,
       (result_data->>'probability') as probability,
       (result_data->>'verdict') as verdict,
       created_at
from public.analyses
where user_id = (select id from auth.users where email = 'demo@pharmstable.app')
order by created_at desc;

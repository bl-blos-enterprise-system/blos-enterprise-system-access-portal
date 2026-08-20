-- Universidad Best Linen: progreso seguro, evaluacion y reconocimientos.
-- La puntuacion y el reconocimiento se calculan exclusivamente en PostgreSQL.

create or replace function api.save_my_ubl_progress(p_payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_role_code text;
  v_display_name text;
  v_role_label text;
  v_course_progress jsonb;
  v_onboarding_step smallint;
  v_context jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  v_context := private.current_access_context();
  select (organization ->> 'organization_id')::uuid, organization ->> 'role_code'
    into v_organization_id, v_role_code
  from jsonb_array_elements(coalesce(v_context -> 'organizations', '[]'::jsonb)) organization
  where coalesce((organization ->> 'access_ready')::boolean, false)
    and organization ->> 'membership_status' = 'active'
  limit 1;

  if v_organization_id is null then
    raise exception 'active_membership_required' using errcode = '42501';
  end if;

  v_display_name := coalesce(
    nullif(v_context -> 'profile' ->> 'preferred_name', ''),
    nullif(v_context -> 'profile' ->> 'full_name', ''),
    'Usuario BES'
  );

  v_role_label := case v_role_code
    when 'owner' then 'Propietario y creador'
    when 'admin' then 'Administrador de plataforma'
    when 'platform_admin' then 'Administrador de plataforma'
    when 'architect' then 'Arquitecto BES'
    when 'manager' then 'Responsable de area'
    when 'analyst' then 'Analista'
    when 'auditor' then 'Auditor'
    when 'operator' then 'Operador'
    else 'Consulta'
  end;

  v_course_progress := jsonb_build_object(
    'bes_architecture', coalesce(p_payload -> 'course_progress' -> 'bes_architecture', 'false'::jsonb) = 'true'::jsonb,
    'safe_execution', coalesce(p_payload -> 'course_progress' -> 'safe_execution', 'false'::jsonb) = 'true'::jsonb,
    'quality_evidence', coalesce(p_payload -> 'course_progress' -> 'quality_evidence', 'false'::jsonb) = 'true'::jsonb,
    'data_decisions', coalesce(p_payload -> 'course_progress' -> 'data_decisions', 'false'::jsonb) = 'true'::jsonb
  );

  select count(*)::smallint
    into v_onboarding_step
  from jsonb_each(v_course_progress) completed
  where completed.value = 'true'::jsonb;

  insert into public.ubl_user_progress (
    user_id, organization_id, display_name, role_label, onboarding_step,
    onboarding_completed_at, course_progress, updated_at
  ) values (
    v_user_id,
    v_organization_id,
    left(v_display_name, 160),
    left(v_role_label, 180),
    v_onboarding_step,
    case when v_onboarding_step = 4 then now() else null end,
    v_course_progress,
    now()
  )
  on conflict (user_id) do update set
    organization_id = excluded.organization_id,
    display_name = excluded.display_name,
    role_label = excluded.role_label,
    onboarding_step = excluded.onboarding_step,
    onboarding_completed_at = case
      when excluded.onboarding_step = 4 then coalesce(public.ubl_user_progress.onboarding_completed_at, now())
      else null
    end,
    course_progress = excluded.course_progress,
    updated_at = now();

  return jsonb_build_object(
    'saved', true,
    'user_id', v_user_id,
    'onboarding_step', v_onboarding_step,
    'course_progress', v_course_progress
  );
end;
$function$;

create or replace function api.submit_ubl_assessment(p_answers jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid;
  v_correct integer;
  v_score numeric(5,2);
  v_attempts integer;
  v_best_score numeric(5,2);
  v_recognition text;
  v_answer_key jsonb := '["b","c","b","a","c","b","a","c"]'::jsonb;
  v_context jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  if jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> 8 then
    raise exception 'eight_answers_required' using errcode = '22023';
  end if;

  if exists (
    select 1 from jsonb_array_elements_text(p_answers) answer(value)
    where answer.value not in ('a', 'b', 'c')
  ) then
    raise exception 'invalid_assessment_answer' using errcode = '22023';
  end if;

  v_context := private.current_access_context();
  select (organization ->> 'organization_id')::uuid
    into v_organization_id
  from jsonb_array_elements(coalesce(v_context -> 'organizations', '[]'::jsonb)) organization
  where coalesce((organization ->> 'access_ready')::boolean, false)
    and organization ->> 'membership_status' = 'active'
  limit 1;

  if v_organization_id is null then
    raise exception 'active_membership_required' using errcode = '42501';
  end if;

  -- Cualquier intento de enviar una puntuacion desde el cliente queda fuera del contrato.
  select count(*)
    into v_correct
  from jsonb_array_elements_text(p_answers) with ordinality submitted(answer, position)
  where submitted.answer = v_answer_key ->> (submitted.position::integer - 1);

  v_score := v_correct * 12.5;

  insert into public.ubl_assessment_attempts (user_id, organization_id, score, answers)
  values (v_user_id, v_organization_id, v_score, p_answers);

  insert into public.ubl_user_progress (user_id, organization_id, best_score, attempts_count, updated_at)
  values (v_user_id, v_organization_id, v_score, 1, now())
  on conflict (user_id) do update set
    organization_id = excluded.organization_id,
    best_score = greatest(coalesce(public.ubl_user_progress.best_score, 0), excluded.best_score),
    attempts_count = public.ubl_user_progress.attempts_count + 1,
    updated_at = now();

  select attempts_count, best_score
    into v_attempts, v_best_score
  from public.ubl_user_progress
  where user_id = v_user_id;

  v_recognition := case
    when v_best_score = 100 and v_attempts >= 3 then 'Mentor BES'
    when v_best_score >= 95 then 'Excelencia UBL'
    when v_best_score >= 90 then 'Distinción Operativa'
    when v_best_score >= 80 then 'Habilitado BES'
    else 'En desarrollo'
  end;

  update public.ubl_user_progress
  set recognition = v_recognition, updated_at = now()
  where user_id = v_user_id;

  return jsonb_build_object(
    'score', v_score,
    'passed', v_score >= 80,
    'correct', v_correct,
    'total', 8,
    'recognition', v_recognition,
    'best_score', v_best_score,
    'attempts_count', v_attempts
  );
end;
$function$;

revoke all on function api.save_my_ubl_progress(jsonb) from public, anon;
grant execute on function api.save_my_ubl_progress(jsonb) to authenticated;
revoke all on function api.submit_ubl_assessment(jsonb) from public, anon;
grant execute on function api.submit_ubl_assessment(jsonb) to authenticated;

comment on function api.save_my_ubl_progress(jsonb) is
  'Guarda exclusivamente el avance curricular del usuario autenticado; no acepta puntuacion ni reconocimiento del cliente.';
comment on function api.submit_ubl_assessment(jsonb) is
  'Califica ocho respuestas en servidor y deriva el reconocimiento UBL sin confiar en valores del cliente.';

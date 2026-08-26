
CREATE TYPE public.app_role AS ENUM ('platform_admin','customer');
CREATE TYPE public.account_status AS ENUM ('active','pending','blocked','suspended');
CREATE TYPE public.subscription_status AS ENUM ('pending','active','expired','canceled','suspended');
CREATE TYPE public.incubator_status AS ENUM ('available','in_use','maintenance','inactive');
CREATE TYPE public.cycle_status AS ENUM ('planned','incubating','candling','hatching','completed','canceled');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  account_status public.account_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'platform_admin');
$$;

CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_select_auth" ON public.plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "plans_admin_all" ON public.plans FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.plans (name, description, duration_days, price)
VALUES ('Mensal', 'Acesso completo por 31 dias', 31, 49.90);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.plans(id),
  status public.subscription_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  payment_provider TEXT,
  external_customer_id TEXT,
  external_subscription_id TEXT,
  external_payment_id TEXT,
  last_payment_at TIMESTAMPTZ,
  next_payment_at TIMESTAMPTZ,
  cancellation_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX subscriptions_user_unique ON public.subscriptions(user_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX subscriptions_expires_idx ON public.subscriptions(expires_at);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_select_own" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'platform_admin') THEN
    NEW.account_status := OLD.account_status;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER profiles_protect BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    JOIN public.profiles p ON p.user_id = s.user_id
    WHERE s.user_id = _user_id
      AND s.status = 'active'
      AND s.expires_at IS NOT NULL
      AND s.expires_at >= now()
      AND p.account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_write()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_active_subscription(auth.uid()) OR public.has_role(auth.uid(),'platform_admin');
$$;

CREATE TABLE public.bird_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  default_incubation_days INTEGER NOT NULL DEFAULT 21 CHECK (default_incubation_days > 0),
  default_candling_day INTEGER NOT NULL DEFAULT 7 CHECK (default_candling_day >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX bird_types_user_idx ON public.bird_types(user_id);

CREATE TABLE public.incubators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  brand TEXT,
  model TEXT,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  type TEXT,
  location TEXT,
  ideal_temperature NUMERIC(4,1),
  ideal_humidity NUMERIC(4,1),
  status public.incubator_status NOT NULL DEFAULT 'available',
  acquisition_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX incubators_user_idx ON public.incubators(user_id);

CREATE TABLE public.incubation_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  incubator_id UUID NOT NULL REFERENCES public.incubators(id) ON DELETE CASCADE,
  bird_type_id UUID REFERENCES public.bird_types(id),
  batch_code TEXT,
  bird_type TEXT,
  egg_origin TEXT,
  egg_quantity INTEGER NOT NULL CHECK (egg_quantity > 0),
  start_date DATE NOT NULL,
  expected_duration_days INTEGER NOT NULL DEFAULT 21 CHECK (expected_duration_days > 0),
  candling_day INTEGER NOT NULL DEFAULT 7 CHECK (candling_day >= 0),
  expected_hatch_date DATE,
  status public.cycle_status NOT NULL DEFAULT 'incubating',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX cycles_user_idx ON public.incubation_cycles(user_id);
CREATE INDEX cycles_incubator_idx ON public.incubation_cycles(incubator_id);
CREATE INDEX cycles_status_idx ON public.incubation_cycles(status);

CREATE TABLE public.candling_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES public.incubation_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  incubation_day INTEGER NOT NULL DEFAULT 0 CHECK (incubation_day >= 0),
  eggs_examined INTEGER NOT NULL DEFAULT 0 CHECK (eggs_examined >= 0),
  fertile_eggs INTEGER NOT NULL DEFAULT 0 CHECK (fertile_eggs >= 0),
  infertile_eggs INTEGER NOT NULL DEFAULT 0 CHECK (infertile_eggs >= 0),
  developing_eggs INTEGER NOT NULL DEFAULT 0 CHECK (developing_eggs >= 0),
  discarded_eggs INTEGER NOT NULL DEFAULT 0 CHECK (discarded_eggs >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT candling_fertile_le_examined CHECK (fertile_eggs <= eggs_examined),
  CONSTRAINT candling_discarded_le_examined CHECK (discarded_eggs <= eggs_examined)
);
CREATE INDEX candling_cycle_idx ON public.candling_records(cycle_id);
CREATE INDEX candling_user_idx ON public.candling_records(user_id);

CREATE TABLE public.hatching_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES public.incubation_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  eggs_set INTEGER NOT NULL DEFAULT 0 CHECK (eggs_set >= 0),
  fertile_eggs INTEGER NOT NULL DEFAULT 0 CHECK (fertile_eggs >= 0),
  final_stage_eggs INTEGER NOT NULL DEFAULT 0 CHECK (final_stage_eggs >= 0),
  chicks_hatched INTEGER NOT NULL DEFAULT 0 CHECK (chicks_hatched >= 0),
  unhatched_eggs INTEGER NOT NULL DEFAULT 0 CHECK (unhatched_eggs >= 0),
  deaths INTEGER NOT NULL DEFAULT 0 CHECK (deaths >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hatch_chicks_le_set CHECK (chicks_hatched <= eggs_set),
  CONSTRAINT hatch_fertile_le_set CHECK (fertile_eggs <= eggs_set)
);
CREATE INDEX hatching_cycle_idx ON public.hatching_records(cycle_id);
CREATE INDEX hatching_user_idx ON public.hatching_records(user_id);

CREATE TABLE public.candling_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  candling_record_id UUID REFERENCES public.candling_records(id) ON DELETE CASCADE,
  hatching_record_id UUID REFERENCES public.hatching_records(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX candling_photos_user_idx ON public.candling_photos(user_id);

CREATE TABLE public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incubator_id UUID NOT NULL REFERENCES public.incubators(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  maintenance_type TEXT NOT NULL DEFAULT 'Limpeza',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  responsible TEXT,
  next_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX maintenance_user_idx ON public.maintenance_records(user_id);
CREATE INDEX maintenance_incubator_idx ON public.maintenance_records(incubator_id);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_cycle_id UUID REFERENCES public.incubation_cycles(id) ON DELETE CASCADE,
  related_incubator_id UUID REFERENCES public.incubators(id) ON DELETE CASCADE,
  event_date DATE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id);
CREATE INDEX notifications_event_idx ON public.notifications(event_date);

CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  target_user_id UUID,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_select" ON public.admin_audit_logs FOR SELECT TO authenticated USING (public.is_admin());

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['bird_types','incubators','incubation_cycles','candling_records','candling_photos','hatching_records','maintenance_records','notifications']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "%1$s_select" ON public.%1$I FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());', t);
    EXECUTE format('CREATE POLICY "%1$s_insert" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.can_write());', t);
    EXECUTE format('CREATE POLICY "%1$s_update" ON public.%1$I FOR UPDATE TO authenticated USING (user_id = auth.uid() AND public.can_write()) WITH CHECK (user_id = auth.uid());', t);
    EXECUTE format('CREATE POLICY "%1$s_delete" ON public.%1$I FOR DELETE TO authenticated USING (user_id = auth.uid() AND public.can_write());', t);
    IF t <> 'candling_photos' AND t <> 'notifications' THEN
      EXECUTE format('CREATE TRIGGER %1$s_updated_at BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t);
    END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.bootstrap_account(_full_name TEXT DEFAULT NULL, _phone TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  uemail TEXT;
  monthly UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT email INTO uemail FROM auth.users WHERE id = uid;

  INSERT INTO public.profiles (user_id, full_name, email, phone, account_status)
  VALUES (uid, COALESCE(_full_name,''), uemail, _phone, 'pending')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  SELECT id INTO monthly FROM public.plans WHERE active ORDER BY duration_days LIMIT 1;
  INSERT INTO public.subscriptions (user_id, plan_id, status) VALUES (uid, monthly, 'pending')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.bird_types (user_id, name, default_incubation_days, default_candling_day)
  SELECT uid, t.name, t.days, t.candling FROM (VALUES
    ('Galinha',21,7),('Codorna',17,6),('Pato',28,8),('Ganso',30,9),('Peru',28,8)
  ) AS t(name,days,candling)
  WHERE NOT EXISTS (SELECT 1 FROM public.bird_types b WHERE b.user_id = uid);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_log(_target UUID, _action TEXT, _description TEXT)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.admin_audit_logs (admin_user_id, target_user_id, action, description)
  VALUES (auth.uid(), _target, _action, _description);
$$;

CREATE OR REPLACE FUNCTION public.admin_activate_subscription(_target_user UUID, _plan_id UUID DEFAULT NULL)
RETURNS public.subscriptions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid UUID; dur INTEGER; s public.subscriptions;
BEGIN
  IF NOT public.has_role(auth.uid(),'platform_admin') THEN RAISE EXCEPTION 'apenas administradores'; END IF;
  SELECT COALESCE(_plan_id, plan_id) INTO pid FROM public.subscriptions WHERE user_id = _target_user;
  IF pid IS NULL THEN SELECT id INTO pid FROM public.plans WHERE active ORDER BY duration_days LIMIT 1; END IF;
  SELECT duration_days INTO dur FROM public.plans WHERE id = pid;
  UPDATE public.subscriptions SET plan_id = pid, status = 'active', started_at = now(),
    expires_at = now() + (dur || ' days')::interval, cancellation_date = NULL
  WHERE user_id = _target_user RETURNING * INTO s;
  UPDATE public.profiles SET account_status = 'active' WHERE user_id = _target_user;
  PERFORM public.admin_log(_target_user, 'subscription_activated', 'Assinatura ativada por ' || dur || ' dias');
  RETURN s;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_renew_subscription(_target_user UUID, _plan_id UUID DEFAULT NULL)
RETURNS public.subscriptions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid UUID; dur INTEGER; base TIMESTAMPTZ; s public.subscriptions;
BEGIN
  IF NOT public.has_role(auth.uid(),'platform_admin') THEN RAISE EXCEPTION 'apenas administradores'; END IF;
  SELECT COALESCE(_plan_id, plan_id), GREATEST(COALESCE(expires_at, now()), now()) INTO pid, base
  FROM public.subscriptions WHERE user_id = _target_user;
  IF pid IS NULL THEN SELECT id INTO pid FROM public.plans WHERE active ORDER BY duration_days LIMIT 1; END IF;
  SELECT duration_days INTO dur FROM public.plans WHERE id = pid;
  UPDATE public.subscriptions SET plan_id = pid, status = 'active',
    started_at = COALESCE(started_at, now()), expires_at = base + (dur || ' days')::interval,
    last_payment_at = now(), cancellation_date = NULL
  WHERE user_id = _target_user RETURNING * INTO s;
  UPDATE public.profiles SET account_status = 'active' WHERE user_id = _target_user;
  PERFORM public.admin_log(_target_user, 'subscription_renewed', 'Assinatura renovada por ' || dur || ' dias');
  RETURN s;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_set_subscription_status(_target_user UUID, _status public.subscription_status)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'platform_admin') THEN RAISE EXCEPTION 'apenas administradores'; END IF;
  UPDATE public.subscriptions SET status = _status,
    cancellation_date = CASE WHEN _status = 'canceled' THEN now() ELSE cancellation_date END,
    expires_at = CASE WHEN _status = 'expired' THEN LEAST(COALESCE(expires_at, now()), now()) ELSE expires_at END
  WHERE user_id = _target_user;
  PERFORM public.admin_log(_target_user, 'subscription_status_changed', 'Assinatura alterada para ' || _status);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_set_account_status(_target_user UUID, _status public.account_status)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'platform_admin') THEN RAISE EXCEPTION 'apenas administradores'; END IF;
  UPDATE public.profiles SET account_status = _status WHERE user_id = _target_user;
  PERFORM public.admin_log(_target_user, 'account_status_changed', 'Conta alterada para ' || _status);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_change_plan(_target_user UUID, _plan_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'platform_admin') THEN RAISE EXCEPTION 'apenas administradores'; END IF;
  UPDATE public.subscriptions SET plan_id = _plan_id WHERE user_id = _target_user;
  PERFORM public.admin_log(_target_user, 'plan_changed', 'Plano alterado');
END; $$;

CREATE OR REPLACE FUNCTION public.my_access_state()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'user_id', auth.uid(),
    'is_admin', public.has_role(auth.uid(),'platform_admin'),
    'has_profile', EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()),
    'account_status', (SELECT account_status FROM public.profiles WHERE user_id = auth.uid()),
    'full_name', (SELECT full_name FROM public.profiles WHERE user_id = auth.uid()),
    'subscription_status', (SELECT status FROM public.subscriptions WHERE user_id = auth.uid()),
    'expires_at', (SELECT expires_at FROM public.subscriptions WHERE user_id = auth.uid()),
    'plan_name', (SELECT p.name FROM public.subscriptions s LEFT JOIN public.plans p ON p.id = s.plan_id WHERE s.user_id = auth.uid()),
    'plan_duration_days', (SELECT p.duration_days FROM public.subscriptions s LEFT JOIN public.plans p ON p.id = s.plan_id WHERE s.user_id = auth.uid()),
    'access_allowed', public.has_active_subscription(auth.uid()) OR public.has_role(auth.uid(),'platform_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.admin_customers()
RETURNS TABLE (
  user_id UUID, full_name TEXT, email TEXT, phone TEXT, account_status public.account_status,
  created_at TIMESTAMPTZ, plan_name TEXT, subscription_status public.subscription_status,
  started_at TIMESTAMPTZ, expires_at TIMESTAMPTZ, days_left INTEGER,
  incubators_count BIGINT, cycles_count BIGINT, eggs_total BIGINT, candlings_count BIGINT, chicks_total BIGINT
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pr.user_id, pr.full_name, pr.email, pr.phone, pr.account_status, pr.created_at,
    pl.name, s.status, s.started_at, s.expires_at,
    CASE WHEN s.expires_at IS NULL THEN NULL ELSE CEIL(EXTRACT(EPOCH FROM (s.expires_at - now()))/86400)::INTEGER END,
    (SELECT count(*) FROM public.incubators i WHERE i.user_id = pr.user_id),
    (SELECT count(*) FROM public.incubation_cycles c WHERE c.user_id = pr.user_id),
    (SELECT COALESCE(sum(c.egg_quantity),0) FROM public.incubation_cycles c WHERE c.user_id = pr.user_id),
    (SELECT count(*) FROM public.candling_records cr WHERE cr.user_id = pr.user_id),
    (SELECT COALESCE(sum(h.chicks_hatched),0) FROM public.hatching_records h WHERE h.user_id = pr.user_id)
  FROM public.profiles pr
  LEFT JOIN public.subscriptions s ON s.user_id = pr.user_id
  LEFT JOIN public.plans pl ON pl.id = s.plan_id
  WHERE public.has_role(auth.uid(),'platform_admin')
    AND NOT public.has_role(pr.user_id,'platform_admin')
  ORDER BY pr.created_at DESC;
$$;

CREATE POLICY "photos_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'incubation-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "photos_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'incubation-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "photos_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'incubation-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

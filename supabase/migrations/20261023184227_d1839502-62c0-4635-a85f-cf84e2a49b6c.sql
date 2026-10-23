CREATE TYPE public.app_role AS ENUM ('admin','organizer');
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 5 AND 150),
  student_code text,
  has_student_code boolean NOT NULL,
  academic_year text NOT NULL CHECK (academic_year IN ('first','second','third','fourth')),
  discovery_source text NOT NULL CHECK (discovery_source IN ('social_media','whatsapp','recommendation')),
  phone text NOT NULL UNIQUE CHECK (phone ~ '^\+201[0125][0-9]{8}$'),
  email text NOT NULL UNIQUE CHECK (email = lower(email) AND char_length(email) <= 255),
  attendance_code text NOT NULL UNIQUE CHECK (attendance_code ~ '^[A-Z0-9]{8}$'),
  checked_in_at timestamptz,
  checked_in_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT code_consistency CHECK ((has_student_code AND student_code IS NOT NULL) OR (NOT has_student_code AND student_code IS NULL))
);
CREATE UNIQUE INDEX registrations_student_code_uq ON public.registrations (upper(student_code)) WHERE student_code IS NOT NULL;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rate_limits (
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.hit_rate_limit(_key text, _max int, _window_seconds int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w timestamptz := to_timestamp(floor(extract(epoch from now()) / _window_seconds) * _window_seconds); c int;
BEGIN
  INSERT INTO rate_limits(key, window_start, count) VALUES (_key, w, 1)
  ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1 RETURNING count INTO c;
  DELETE FROM rate_limits WHERE window_start < now() - interval '1 day';
  RETURN c <= _max;
END $$;
REVOKE ALL ON FUNCTION public.hit_rate_limit(text,int,int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(text,int,int) TO service_role;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER registrations_updated_at BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
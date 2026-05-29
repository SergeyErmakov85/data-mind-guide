DROP POLICY IF EXISTS certificates_verify_by_hash ON public.certificates;

CREATE OR REPLACE FUNCTION public.verify_certificate(cert_hash text)
RETURNS TABLE (
  hash text,
  display_name text,
  score numeric,
  total_questions integer,
  issued_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.hash, c.display_name, c.score, c.total_questions, c.issued_at
  FROM public.certificates c
  WHERE c.hash = cert_hash
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
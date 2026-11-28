CREATE OR REPLACE FUNCTION public.get_admin_users_list(
  p_search text DEFAULT NULL,
  p_status text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  avatar text,
  status text,
  ban_reason text,
  banned_at timestamp with time zone,
  created_at timestamp with time zone,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_permission('manage_users') THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone AS phone,
    p.avatar AS avatar,
    p.status,
    p.ban_reason,
    p.banned_at,
    p.created_at,
    COALESCE(
      array_agg(r.name) FILTER (WHERE r.name IS NOT NULL),
      ARRAY[]::text[]
    ) AS roles
  FROM public.profiles AS p
  LEFT JOIN public.user_roles AS ur ON ur.user_id = p.id
  LEFT JOIN public.roles AS r ON r.id = ur.role_id
  WHERE
    (p_status IS NULL OR p.status = p_status)
    AND (
      p_search IS NULL
      OR p.email ILIKE '%' || p_search || '%'
      OR p.first_name ILIKE '%' || p_search || '%'
      OR p.last_name ILIKE '%' || p_search || '%'
      OR p.phone ILIKE '%' || p_search || '%'
    )
  GROUP BY p.id
  ORDER BY p.created_at DESC;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_admin_users_list(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_admin_users_list(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users_list(text, text) TO authenticated;
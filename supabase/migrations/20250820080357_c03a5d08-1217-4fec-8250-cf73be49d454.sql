-- Fix the handle_new_user function with proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, 'https://fzzpkdaaewrpaaaaudmh.supabase.co/storage/v1/object/public/avatars/default-avatar.png');
  RETURN new;
END;
$function$
-- Allows admins to view newsletter subscribers in the admin dashboard.
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Admins can view newsletter subscribers" on public.newsletter_subscribers;

create policy "Admins can view newsletter subscribers"
on public.newsletter_subscribers for select to authenticated
using (public.is_admin());

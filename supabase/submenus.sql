-- Run this once in the Supabase SQL Editor if the site was created before submenus.
-- Safe to run again: it only adds the column when it is missing.

alter table public.menus
  add column if not exists parent_id bigint references public.menus (id) on delete cascade;

create index if not exists menus_parent_id_idx on public.menus (parent_id);

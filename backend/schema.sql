-- ─────────────────────────────────────────────────────────────
-- FieldAgent Database Schema v3 — Single Flat Table
-- Paste this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- Drop old tables
drop table if exists visit_plans  cascade;
drop table if exists borrowers    cascade;
drop table if exists field_agents cascade;
drop table if exists field_visits cascade;

-- Single flat table matching CSV columns
create table field_visits (
  borrower_id               varchar(255) primary key default gen_random_uuid(),
  borrower_name             text not null,
  city                      text,
  latitude                  double precision,
  longitude                 double precision,
  outstanding_loan_amount   numeric(14, 2) default 0,
  days_past_due             integer default 0,
  distance_km      numeric(10, 3),
  travel_cost_inr  numeric(10, 2),
  priority_score   numeric(8, 4),
  visit_rank       integer,
  remark           text
);

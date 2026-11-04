-- Migration: Add ride_date to rides table for clear carpooling departure dates
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS ride_date text DEFAULT 'Jutro';

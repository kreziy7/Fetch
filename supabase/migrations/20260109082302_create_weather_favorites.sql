/*
  # Weather Favorites Application Schema

  ## Overview
  Creates tables to store weather favorites and search history for users

  ## New Tables
  
  ### `weather_favorites`
  - `id` (uuid, primary key) - Unique identifier for each favorite
  - `city_name` (text) - Name of the city
  - `country` (text) - Country name
  - `latitude` (numeric) - Latitude coordinate
  - `longitude` (numeric) - Longitude coordinate
  - `notes` (text, nullable) - Optional notes about the location
  - `created_at` (timestamptz) - When the favorite was created
  - `updated_at` (timestamptz) - When the favorite was last updated

  ## Security
  - Enable RLS on `weather_favorites` table
  - Public access policies for this demo app (no authentication required)
  - Allow all operations (SELECT, INSERT, UPDATE, DELETE) for anyone

  ## Important Notes
  1. This is a demo app without user authentication
  2. RLS is enabled but policies allow public access
  3. All CRUD operations are permitted for demonstration purposes
*/

CREATE TABLE IF NOT EXISTS weather_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name text NOT NULL,
  country text DEFAULT '',
  latitude numeric,
  longitude numeric,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE weather_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON weather_favorites
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access"
  ON weather_favorites
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON weather_favorites
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON weather_favorites
  FOR DELETE
  TO anon
  USING (true);
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create couple_spaces table
CREATE TABLE public.couple_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Quest dla Dwojga',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.couple_spaces ENABLE ROW LEVEL SECURITY;

-- Create couple_members table (joins users to couple spaces)
CREATE TABLE public.couple_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid REFERENCES public.couple_spaces(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(couple_space_id, user_id)
);

ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own couple memberships"
  ON public.couple_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view couple spaces they belong to"
  ON public.couple_spaces FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = couple_spaces.id
      AND couple_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update couple spaces they belong to"
  ON public.couple_spaces FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = couple_spaces.id
      AND couple_members.user_id = auth.uid()
    )
  );

-- Create task_category enum
CREATE TYPE public.task_category AS ENUM ('dom', 'finanse', 'zdrowie', 'relacja', 'inne');

-- Create tasks table
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid REFERENCES public.couple_spaces(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category task_category NOT NULL DEFAULT 'inne',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  completed_at timestamptz,
  due_date date,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their couple space"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = tasks.couple_space_id
      AND couple_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their couple space"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = tasks.couple_space_id
      AND couple_members.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Users can update tasks in their couple space"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = tasks.couple_space_id
      AND couple_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks they created"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create missions table
CREATE TABLE public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid REFERENCES public.couple_spaces(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category task_category NOT NULL DEFAULT 'inne',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_shared boolean DEFAULT false NOT NULL,
  exp_reward integer DEFAULT 10 NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  completed_at timestamptz,
  streak_count integer DEFAULT 0 NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view missions in their couple space"
  ON public.missions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = missions.couple_space_id
      AND couple_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create missions in their couple space"
  ON public.missions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = missions.couple_space_id
      AND couple_members.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Users can update missions in their couple space"
  ON public.missions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = missions.couple_space_id
      AND couple_members.user_id = auth.uid()
    )
  );

-- Create user_exp table to track points
CREATE TABLE public.user_exp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid REFERENCES public.couple_spaces(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exp_points integer DEFAULT 0 NOT NULL,
  UNIQUE(couple_space_id, user_id)
);

ALTER TABLE public.user_exp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exp in their couple space"
  ON public.user_exp FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = user_exp.couple_space_id
      AND couple_members.user_id = auth.uid()
    )
  );

-- Create rewards table
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_space_id uuid REFERENCES public.couple_spaces(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  cost_points integer NOT NULL,
  is_shared boolean DEFAULT false NOT NULL,
  for_user uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rewards in their couple space"
  ON public.rewards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = rewards.couple_space_id
      AND couple_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rewards in their couple space"
  ON public.rewards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = rewards.couple_space_id
      AND couple_members.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Users can update rewards in their couple space"
  ON public.rewards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.couple_members
      WHERE couple_members.couple_space_id = rewards.couple_space_id
      AND couple_members.user_id = auth.uid()
    )
  );

-- Create reward_redemptions table
CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id uuid REFERENCES public.rewards(id) ON DELETE CASCADE NOT NULL,
  redeemed_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  redeemed_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view redemptions in their couple space"
  ON public.reward_redemptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rewards r
      JOIN public.couple_members cm ON cm.couple_space_id = r.couple_space_id
      WHERE r.id = reward_redemptions.reward_id
      AND cm.user_id = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'User'));
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
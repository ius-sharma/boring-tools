-- ==============================================================================
-- BORING TOOLS - DATABASE SCHEMA & SECURITY POLICIES
-- PostgreSQL + Supabase RLS + Atomic Functions
-- ==============================================================================

-- 1. PROFILES TABLE (Public user profile synced from Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SUBSCRIPTIONS TABLE (Tracks Stripe / Razorpay / LemonSqueezy subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    customer_id TEXT, -- Stripe / LemonSqueezy customer ID
    subscription_id TEXT UNIQUE, -- Stripe sub_xxx ID
    price_id TEXT, -- Price ID or Plan identifier
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro_monthly', 'pro_yearly')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. USER CREDITS TABLE (Tracks daily free credits & paid top-up credit balances)
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    credits_balance INT DEFAULT 10 NOT NULL, -- Daily free credits or paid balance
    bonus_credits INT DEFAULT 0 NOT NULL, -- Non-expiring purchased credits
    daily_quota_limit INT DEFAULT 10 NOT NULL, -- Default 10 for free users, 500 for pro
    last_reset_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. USAGE LOGS TABLE (Audit log of every tool execution)
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    anon_session_id TEXT, -- For guest users
    tool_id TEXT NOT NULL,
    credits_used INT DEFAULT 1 NOT NULL,
    ip_hash TEXT, -- SHA-256 hash of IP for privacy-preserving rate limiting
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'blocked')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. WEBHOOK EVENTS TABLE (Idempotency shield for payments)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id TEXT PRIMARY KEY, -- Stripe event_id (evt_xxx)
    event_type TEXT NOT NULL,
    provider TEXT DEFAULT 'stripe',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & update only their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: Users can read their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- User Credits: Users can view their own credits
CREATE POLICY "Users can view own credits" ON public.user_credits
    FOR SELECT USING (auth.uid() = user_id);

-- Usage Logs: Users can view their own logs
CREATE POLICY "Users can view own logs" ON public.usage_logs
    FOR SELECT USING (auth.uid() = user_id);

-- ==============================================================================
-- ATOMIC STORED PROCEDURES (RACE-CONDITION RESISTANT)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.deduct_user_credits(
    p_user_id UUID,
    p_cost INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_credits RECORD;
    v_sub RECORD;
    v_is_pro BOOLEAN := FALSE;
    v_today DATE := CURRENT_DATE;
BEGIN
    -- 1. Check if user has an active Pro subscription
    SELECT * INTO v_sub FROM public.subscriptions 
    WHERE user_id = p_user_id AND status = 'active' AND plan_tier IN ('pro_monthly', 'pro_yearly');
    
    IF FOUND THEN
        v_is_pro := TRUE;
    END IF;

    -- 2. Lock and retrieve user credit record
    SELECT * INTO v_credits FROM public.user_credits 
    WHERE user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
        -- Create record if it doesn't exist
        INSERT INTO public.user_credits (user_id, credits_balance, daily_quota_limit, last_reset_date)
        VALUES (p_user_id, 10, 10, v_today)
        RETURNING * INTO v_credits;
    END IF;

    -- 3. If new calendar day, refresh daily quota
    IF v_credits.last_reset_date < v_today THEN
        v_credits.credits_balance := v_credits.daily_quota_limit;
        v_credits.last_reset_date := v_today;
    END IF;

    -- 4. If user is PRO, grant access
    IF v_is_pro THEN
        UPDATE public.user_credits 
        SET last_reset_date = v_credits.last_reset_date,
            updated_at = NOW()
        WHERE user_id = p_user_id;

        RETURN jsonb_build_object(
            'success', TRUE,
            'is_pro', TRUE,
            'remaining', v_credits.credits_balance + v_credits.bonus_credits,
            'message', 'Pro access granted'
        );
    END IF;

    -- 5. If free user, check balance
    IF (v_credits.credits_balance + v_credits.bonus_credits) < p_cost THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'is_pro', FALSE,
            'remaining', v_credits.credits_balance + v_credits.bonus_credits,
            'message', 'Insufficient credits'
        );
    END IF;

    -- 6. Atomic Deduct
    IF v_credits.credits_balance >= p_cost THEN
        v_credits.credits_balance := v_credits.credits_balance - p_cost;
    ELSE
        DECLARE
            v_remaining_cost INT := p_cost - v_credits.credits_balance;
        BEGIN
            v_credits.credits_balance := 0;
            v_credits.bonus_credits := v_credits.bonus_credits - v_remaining_cost;
        END;
    END IF;

    -- 7. Update database
    UPDATE public.user_credits 
    SET credits_balance = v_credits.credits_balance,
        bonus_credits = v_credits.bonus_credits,
        last_reset_date = v_credits.last_reset_date,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'is_pro', FALSE,
        'remaining', v_credits.credits_balance + v_credits.bonus_credits,
        'message', 'Credits deducted successfully'
    );
END;
$$;

-- ==============================================================================
-- TRIGGER: Automatically create profile & default credits on new signup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_credits (user_id, credits_balance, daily_quota_limit, last_reset_date)
    VALUES (NEW.id, 10, 10, CURRENT_DATE)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.subscriptions (user_id, plan_tier, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

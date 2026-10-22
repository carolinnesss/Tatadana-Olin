-- ====================================================================
-- TataDana Database Schema Migration (Supabase PostgreSQL)
-- Created for: TataDana - Smart Financial Management with Telegram Bot
-- Timezone: Asia/Jakarta (WIB)
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone default
SET timezone = 'Asia/Jakarta';

-- 1. PROFILES (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    phone_number TEXT UNIQUE,
    phone_verified BOOLEAN DEFAULT FALSE,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    currency TEXT DEFAULT 'IDR',
    plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'superadmin')),
    telegram_chat_id BIGINT UNIQUE,
    telegram_username TEXT,
    telegram_bot_token TEXT,
    telegram_connected BOOLEAN DEFAULT FALSE,
    daily_reminder_enabled BOOLEAN DEFAULT FALSE,
    daily_reminder_frequency INTEGER DEFAULT 1 CHECK (daily_reminder_frequency IN (1, 2)),
    reminder_time_1 TIME DEFAULT '20:00:00',
    reminder_time_2 TIME DEFAULT '12:00:00',
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 2. WALLETS (Multi-wallet support)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'bank' CHECK (type IN ('cash', 'bank', 'ewallet', 'investment', 'other')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    color TEXT DEFAULT '#800020',
    icon TEXT DEFAULT 'wallet',
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 3. CATEGORIES & BUDGETS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
    emoji TEXT NOT NULL DEFAULT '🏷️',
    color TEXT DEFAULT '#800020',
    monthly_budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 4. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    destination_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    notes TEXT,
    source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'telegram_text', 'telegram_photo', 'telegram_voice')),
    receipt_url TEXT,
    receipt_items JSONB,
    raw_ai_transcript TEXT,
    raw_ai_response JSONB,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 5. TELEGRAM UPDATES (Idempotency check to prevent duplicate webhooks)
CREATE TABLE IF NOT EXISTS public.telegram_updates (
    update_id BIGINT PRIMARY KEY,
    chat_id BIGINT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    status TEXT DEFAULT 'processed'
);

-- 6. AI PROVIDERS CONFIG (Managed by Admin Dashboard)
CREATE TABLE IF NOT EXISTS public.ai_providers_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT UNIQUE NOT NULL CHECK (provider_name IN ('gemini', 'openai', 'deepseek')),
    api_key_encrypted TEXT NOT NULL,
    model_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    mode TEXT DEFAULT 'single' CHECK (mode IN ('single', 'parallel_failover')),
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 7. AI CALL LOGS (Debugging, latency & token monitoring)
CREATE TABLE IF NOT EXISTS public.ai_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('parse_text', 'parse_receipt', 'transcribe_audio', 'advisor', 'onboarding')),
    prompt_tokens INTEGER DEFAULT 0,
    response_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'fallback')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 8. PAYMENTS (Midtrans & Manual Transfer with Admin Approval)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro')),
    amount NUMERIC(15, 2) NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('midtrans', 'manual_transfer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settlement', 'approved', 'rejected', 'expired')),
    proof_image_url TEXT,
    midtrans_response JSONB,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 9. EXPORT HISTORY (PDF & Excel generated reports stored in Supabase Storage)
CREATE TABLE IF NOT EXISTS public.export_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'xlsx')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_kb INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- 10. ADMIN AUDIT LOGS (Compliance & privacy logging)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON public.transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_wallet ON public.transactions(user_id, wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram ON public.profiles(telegram_chat_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_call_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES (Users can only read & write their own data; Admins can view for support)
CREATE POLICY "Users can access own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can access own wallets" ON public.wallets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own payments" ON public.payments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own export history" ON public.export_history
    FOR ALL USING (auth.uid() = user_id);

-- FUNCTION: Seed Default User Data on Registration
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
DECLARE
    default_wallet_id UUID;
BEGIN
    -- 1. Create Default Wallet (Cash & BCA)
    INSERT INTO public.wallets (user_id, name, type, balance, is_default, color, icon)
    VALUES (NEW.id, 'Cash / Dompet Tunai', 'cash', 0, TRUE, '#2563eb', 'wallet')
    RETURNING id INTO default_wallet_id;

    INSERT INTO public.wallets (user_id, name, type, balance, is_default, color, icon)
    VALUES (NEW.id, 'Bank BCA', 'bank', 0, FALSE, '#0284c7', 'landmark');

    -- 2. Create Default Categories (Recommended Set)
    INSERT INTO public.categories (user_id, name, type, emoji, color, monthly_budget, is_system) VALUES
    (NEW.id, 'Makanan & Minuman', 'expense', '🍜', '#800020', 1500000, TRUE),
    (NEW.id, 'Transportasi', 'expense', '🚗', '#0284c7', 500000, TRUE),
    (NEW.id, 'Tagihan & Utilitas', 'expense', '🏠', '#ef4444', 1000000, TRUE),
    (NEW.id, 'Belanja Kebutuhan', 'expense', '👕', '#8b5cf6', 750000, TRUE),
    (NEW.id, 'Hiburan & Hobi', 'expense', '🎮', '#ec4899', 400000, TRUE),
    (NEW.id, 'Kesehatan', 'expense', '💊', '#10b981', 300000, TRUE),
    (NEW.id, 'Gaji & Pendapatan', 'income', '💰', '#16a34a', 0, TRUE),
    (NEW.id, 'Freelance / Side Job', 'income', '💻', '#2563eb', 0, TRUE);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER: Auto-run on profile creation
DROP TRIGGER IF EXISTS trg_new_user_setup ON public.profiles;
CREATE TRIGGER trg_new_user_setup
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_setup();

-- REALTIME PUBLICATION
-- Enable realtime for transactions, wallets, and categories
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;

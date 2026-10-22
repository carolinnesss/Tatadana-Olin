-- ====================================================================
-- TataDana Initial Demo & Seed Data
-- ====================================================================

-- 1. Demo User (User ID: 00000000-0000-0000-0000-000000000001)
INSERT INTO public.profiles (
    id, email, phone_number, phone_verified, full_name, avatar_url, currency, plan, role,
    telegram_chat_id, telegram_username, telegram_connected, daily_reminder_enabled, daily_reminder_frequency, reminder_time_1
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'budi.santoso@example.com',
    '+6281234567890',
    TRUE,
    'Budi Santoso',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'IDR',
    'pro',
    'superadmin',
    123456789,
    '@budisantoso_id',
    TRUE,
    TRUE,
    2,
    '20:00:00'
) ON CONFLICT (id) DO NOTHING;

-- Demo Starter User
INSERT INTO public.profiles (
    id, email, phone_number, phone_verified, full_name, avatar_url, currency, plan, role,
    telegram_chat_id, telegram_username, telegram_connected, daily_reminder_enabled
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'siti.aminah@example.com',
    '+6289876543210',
    TRUE,
    'Siti Aminah',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'IDR',
    'starter',
    'user',
    987654321,
    '@sitiaminah',
    FALSE,
    FALSE
) ON CONFLICT (id) DO NOTHING;

-- 2. Wallets for Budi
INSERT INTO public.wallets (id, user_id, name, type, balance, is_default, color, icon) VALUES
('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000001', 'Bank BCA Utama', 'bank', 8750000, TRUE, '#2563eb', 'landmark'),
('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000001', 'Dompet Tunai (Cash)', 'cash', 450000, FALSE, '#16a34a', 'wallet'),
('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000001', 'GoPay & OVO', 'ewallet', 320000, FALSE, '#0284c7', 'smartphone'),
('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000001', 'Bank Mandiri Bisnis', 'bank', 12500000, FALSE, '#0d9488', 'building')
ON CONFLICT (id) DO NOTHING;

-- 3. Categories for Budi
INSERT INTO public.categories (id, user_id, name, type, emoji, color, monthly_budget, is_system) VALUES
('22222222-2222-2222-2222-222222222201', '00000000-0000-0000-0000-000000000001', 'Makanan & Minuman', 'expense', '🍜', '#2563eb', 2500000, TRUE),
('22222222-2222-2222-2222-222222222202', '00000000-0000-0000-0000-000000000001', 'Transportasi', 'expense', '🚗', '#0284c7', 800000, TRUE),
('22222222-2222-2222-2222-222222222203', '00000000-0000-0000-0000-000000000001', 'Tagihan & Utilitas', 'expense', '🏠', '#ef4444', 1500000, TRUE),
('22222222-2222-2222-2222-222222222204', '00000000-0000-0000-0000-000000000001', 'Belanja Kebutuhan', 'expense', '👕', '#8b5cf6', 1200000, TRUE),
('22222222-2222-2222-2222-222222222205', '00000000-0000-0000-0000-000000000001', 'Hiburan & Hobi', 'expense', '🎮', '#ec4899', 600000, TRUE),
('22222222-2222-2222-2222-222222222206', '00000000-0000-0000-0000-000000000001', 'Kesehatan', 'expense', '💊', '#10b981', 500000, TRUE),
('22222222-2222-2222-2222-222222222207', '00000000-0000-0000-0000-000000000001', 'Gaji & Bonus', 'income', '💰', '#16a34a', 0, TRUE),
('22222222-2222-2222-2222-222222222208', '00000000-0000-0000-0000-000000000001', 'Project Freelance', 'income', '💻', '#3b82f6', 0, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Realistic Transactions for Budi (Past 30 days)
INSERT INTO public.transactions (
    user_id, wallet_id, category_id, type, amount, transaction_date, notes, source, receipt_items
) VALUES
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222207', 'income', 12500000, CURRENT_DATE - 12, 'Gaji Bulanan PT Maju Bersama', 'web', NULL),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222208', 'income', 3500000, CURRENT_DATE - 5, 'DP Project Desain Landing Page', 'web', NULL),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 'expense', 45000, CURRENT_DATE, 'Makan Siang Nasi Padang Sederhana', 'telegram_text', NULL),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222202', 'expense', 28000, CURRENT_DATE, 'Gojek ke Stasiun Sudirman', 'telegram_voice', NULL),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222203', 'expense', 450000, CURRENT_DATE - 2, 'Token Listrik PLN & Internet Indihome', 'telegram_text', NULL),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222204', 'expense', 275000, CURRENT_DATE - 3, 'Belanja Mingguan Indomaret (Struk)', 'telegram_photo', '[{"name":"Minyak Goreng 2L","price":38000,"qty":1,"category":"Belanja Kebutuhan"},{"name":"Beras Premium 5kg","price":74000,"qty":1,"category":"Belanja Kebutuhan"},{"name":"Telur Ayam 1kg","price":29000,"qty":1,"category":"Belanja Kebutuhan"},{"name":"Kopi & Susu UHT","price":48000,"qty":2,"category":"Makanan & Minuman"},{"name":"Deterjen & Sabun Mandi","price":86000,"qty":1,"category":"Belanja Kebutuhan"}]'::jsonb),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222201', 'expense', 18000, CURRENT_DATE - 4, 'Beli Bakso Urat Pinggir Jalan', 'telegram_text', NULL),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222205', 'expense', 150000, CURRENT_DATE - 6, 'Nonton Bioskop XXI & Popcorn', 'telegram_text', NULL),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222201', 'expense', 32000, CURRENT_DATE - 7, 'Kopi Kenangan Mantan Large', 'telegram_text', NULL),
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222206', 'expense', 95000, CURRENT_DATE - 8, 'Beli Vitamin C & Obat Flu di Kimia Farma', 'web', NULL);

-- 5. AI Providers Configuration
INSERT INTO public.ai_providers_config (provider_name, api_key_encrypted, model_name, is_active, is_primary, mode) VALUES
('gemini', 'enc_gemini_prod_key_live', 'gemini-1.5-flash', TRUE, TRUE, 'parallel_failover'),
('openai', 'enc_openai_prod_key_live', 'gpt-4o-mini', TRUE, FALSE, 'parallel_failover'),
('deepseek', 'enc_deepseek_prod_key_live', 'deepseek-chat', FALSE, FALSE, 'single')
ON CONFLICT (provider_name) DO NOTHING;

-- 6. Sample AI Call Logs
INSERT INTO public.ai_call_logs (user_id, provider, action_type, prompt_tokens, response_tokens, latency_ms, status) VALUES
('00000000-0000-0000-0000-000000000001', 'gemini', 'parse_text', 120, 45, 320, 'success'),
('00000000-0000-0000-0000-000000000001', 'gemini', 'parse_receipt', 450, 180, 890, 'success'),
('00000000-0000-0000-0000-000000000001', 'gemini', 'transcribe_audio', 240, 60, 540, 'success'),
('00000000-0000-0000-0000-000000000001', 'gemini', 'advisor', 380, 140, 610, 'success');

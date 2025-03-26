-- Create subscription plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price_id TEXT NOT NULL,
    price_amount INTEGER NOT NULL,
    price_currency TEXT NOT NULL DEFAULT 'usd',
    interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
    features TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payment history table
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    stripe_payment_intent_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
    payment_method TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function to create or update subscription
CREATE OR REPLACE FUNCTION create_or_update_subscription(
    p_user_id UUID,
    p_plan_id UUID,
    p_stripe_subscription_id TEXT,
    p_stripe_customer_id TEXT,
    p_status TEXT,
    p_current_period_start TIMESTAMPTZ,
    p_current_period_end TIMESTAMPTZ,
    p_cancel_at_period_end BOOLEAN
) RETURNS UUID AS $$
DECLARE
    v_subscription_id UUID;
BEGIN
    -- Check if subscription exists
    SELECT id INTO v_subscription_id
    FROM subscriptions
    WHERE stripe_subscription_id = p_stripe_subscription_id;

    IF v_subscription_id IS NULL THEN
        -- Create new subscription
        INSERT INTO subscriptions (
            user_id,
            plan_id,
            stripe_subscription_id,
            stripe_customer_id,
            status,
            current_period_start,
            current_period_end,
            cancel_at_period_end
        ) VALUES (
            p_user_id,
            p_plan_id,
            p_stripe_subscription_id,
            p_stripe_customer_id,
            p_status,
            p_current_period_start,
            p_current_period_end,
            p_cancel_at_period_end
        ) RETURNING id INTO v_subscription_id;
    ELSE
        -- Update existing subscription
        UPDATE subscriptions
        SET
            status = p_status,
            current_period_start = p_current_period_start,
            current_period_end = p_current_period_end,
            cancel_at_period_end = p_cancel_at_period_end,
            updated_at = NOW()
        WHERE id = v_subscription_id;
    END IF;

    RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to log payment
CREATE OR REPLACE FUNCTION log_payment(
    p_user_id UUID,
    p_subscription_id UUID,
    p_stripe_payment_intent_id TEXT,
    p_amount INTEGER,
    p_currency TEXT,
    p_status TEXT,
    p_payment_method TEXT
) RETURNS UUID AS $$
DECLARE
    v_payment_id UUID;
BEGIN
    INSERT INTO payment_history (
        user_id,
        subscription_id,
        stripe_payment_intent_id,
        amount,
        currency,
        status,
        payment_method
    ) VALUES (
        p_user_id,
        p_subscription_id,
        p_stripe_payment_intent_id,
        p_amount,
        p_currency,
        p_status,
        p_payment_method
    ) RETURNING id INTO v_payment_id;

    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read subscription plans
CREATE POLICY "Allow public read access to subscription plans"
    ON subscription_plans FOR SELECT
    USING (true);

-- Allow users to read their own subscriptions
CREATE POLICY "Allow users to read their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to read their own payment history
CREATE POLICY "Allow users to read their own payment history"
    ON payment_history FOR SELECT
    USING (auth.uid() = user_id);

-- Insert some default subscription plans
INSERT INTO subscription_plans (name, description, price_id, price_amount, interval, features)
VALUES
    ('Basic', 'Access to basic features', 'price_basic_monthly', 999, 'month', ARRAY[
        'Access to all news articles',
        'Basic search functionality',
        'Email notifications'
    ]),
    ('Pro', 'Access to premium features', 'price_pro_monthly', 1999, 'month', ARRAY[
        'Everything in Basic',
        'Advanced search filters',
        'Priority email notifications',
        'Ad-free experience'
    ]),
    ('Enterprise', 'Full access to all features', 'price_enterprise_monthly', 4999, 'month', ARRAY[
        'Everything in Pro',
        'Custom newsletter creation',
        'API access',
        'Dedicated support'
    ]); 
-- Create invoices table
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'unpaid', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    client_id UUID NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES guests(id)
);

-- Create invoice_items table
CREATE TABLE invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Create payment_methods table
CREATE TABLE payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    card_type VARCHAR(50) NOT NULL,
    last_four VARCHAR(4) NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_default_per_user UNIQUE (user_id, is_default) WHERE is_default = TRUE
);

-- Create billing_settings table
CREATE TABLE billing_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    auto_payments BOOLEAN DEFAULT FALSE,
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'annually')),
    billing_address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Invoices policies
CREATE POLICY "Users can view their own invoices"
    ON invoices FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can create invoices"
    ON invoices FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own invoices"
    ON invoices FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own invoices"
    ON invoices FOR DELETE
    USING (created_by = auth.uid());

-- Invoice items policies
CREATE POLICY "Users can view their own invoice items"
    ON invoice_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.created_by = auth.uid()
    ));

CREATE POLICY "Users can create invoice items"
    ON invoice_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.created_by = auth.uid()
    ));

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods"
    ON payment_methods FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payment methods"
    ON payment_methods FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payment methods"
    ON payment_methods FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own payment methods"
    ON payment_methods FOR DELETE
    USING (user_id = auth.uid());

-- Billing settings policies
CREATE POLICY "Users can view their own billing settings"
    ON billing_settings FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own billing settings"
    ON billing_settings FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own billing settings"
    ON billing_settings FOR UPDATE
    USING (user_id = auth.uid());

-- Payments policies
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = payments.invoice_id
        AND invoices.created_by = auth.uid()
    ));

CREATE POLICY "Users can create payments"
    ON payments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = payments.invoice_id
        AND invoices.created_by = auth.uid()
    ));

-- Create indexes
CREATE INDEX idx_invoices_created_by ON invoices(created_by);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_method_id ON payments(payment_method_id);

-- Create default billing settings for existing users
INSERT INTO billing_settings (user_id, auto_payments, billing_cycle, billing_address)
SELECT id, false, 'monthly', '{"street": "", "city": "", "state": "", "postal_code": "", "country": ""}'::jsonb
FROM auth.users
ON CONFLICT (user_id) DO NOTHING; 
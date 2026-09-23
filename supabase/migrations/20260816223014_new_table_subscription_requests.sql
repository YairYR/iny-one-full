-- Tabla para historial de solicitudes de suscripción
CREATE TABLE IF NOT EXISTS public.subscription_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    request_type TEXT NOT NULL CHECK (request_type IN ('new', 'upgrade', 'downgrade', 'reactivate')),
    status TEXT NOT NULL CHECK (status IN ('INSERTED', 'APPROVAL_PENDING', 'APPROVED', 'ACTIVE', 'REJECTED', 'EXPIRED')),
    subscription_gateway TEXT NOT NULL DEFAULT 'paypal',
    external_subscription_id TEXT,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
-- Índices para optimizar consultas
CREATE INDEX idx_subscription_requests_user_id ON public.subscription_requests(user_id);
CREATE INDEX idx_subscription_requests_status ON public.subscription_requests(status);
CREATE INDEX idx_subscription_requests_external_id ON public.subscription_requests(external_subscription_id);
CREATE INDEX idx_subscription_requests_user_status_created ON public.subscription_requests(user_id, status, created_at DESC);
-- Habilitar RLS
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;
-- Política: los usuarios autenticados pueden ver sus propias solicitudes
CREATE POLICY "Users can view their own subscription requests"
  ON public.subscription_requests
  FOR SELECT
     TO authenticated
     USING (auth.uid() = user_id);

alter table public.payments
  add column if not exists "providerSessionId" varchar,
  add column if not exists "providerPaymentId" varchar,
  add column if not exists "receiptUrl" varchar,
  add column if not exists "failureReason" varchar;

create unique index if not exists payments_provider_session_id_idx
  on public.payments("providerSessionId")
  where "providerSessionId" is not null;

create unique index if not exists payments_provider_payment_id_idx
  on public.payments("providerPaymentId")
  where "providerPaymentId" is not null;

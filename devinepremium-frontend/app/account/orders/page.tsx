"use client";

import { CustomerAccountWrapper } from "@/components/account/CustomerAccountWrapper";
import { OrdersPanel } from "@/components/account/OrdersPanel";
import { UserSession } from "@/lib/auth";

export default function OrdersPage() {
  return (
    <CustomerAccountWrapper activeSection="orders">
      {({ session, bookingData, mutateBookings }) => (
        <OrdersPanel
          session={session as UserSession}
          bookings={bookingData?.bookings ?? []}
          mutateBookings={mutateBookings}
        />
      )}
    </CustomerAccountWrapper>
  );
}

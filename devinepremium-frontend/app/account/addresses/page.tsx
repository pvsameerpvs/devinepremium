"use client";

import { CustomerAccountWrapper } from "@/components/account/CustomerAccountWrapper";
import { AddressesTab } from "@/components/account/tabs/AddressesTab";
import { UserSession } from "@/lib/auth";

export default function AddressesPage() {
  return (
    <CustomerAccountWrapper activeSection="addresses">
      {({ session, accountData, mutateAccount }) => (
        <AddressesTab
          session={session as UserSession}
          accountData={accountData}
          mutateAccount={mutateAccount}
        />
      )}
    </CustomerAccountWrapper>
  );
}

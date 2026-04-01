"use client";

import { CustomerAccountWrapper } from "@/components/account/CustomerAccountWrapper";
import { ProfileTab } from "@/components/account/tabs/ProfileTab";
import { UserSession } from "@/lib/auth";

export default function ProfilePage() {
  return (
    <CustomerAccountWrapper activeSection="profile">
      {({ session, accountData, mutateAccount }) => (
        <ProfileTab
          session={session as UserSession}
          accountData={accountData}
          mutateAccount={mutateAccount}
        />
      )}
    </CustomerAccountWrapper>
  );
}

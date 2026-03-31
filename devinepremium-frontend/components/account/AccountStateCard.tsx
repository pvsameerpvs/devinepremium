import type { ReactNode } from "react";
import { shellCardClass } from "./account-shared";

export function AccountStateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={`${shellCardClass} p-8 text-center sm:p-10`}>
      <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-700">
        Customer account
      </p>
      <h1 className="mt-4 text-3xl font-black text-slate-900">{title}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
        {description}
      </p>
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
    </div>
  );
}

"use client";
import WithdrawForm from "@/components/WithdrawForm";
import WithdrawalHistory from "@/components/WithdrawalHistory";

export default function WithdrawPage() {
  return (
   <div className="max-w-5xl mx-auto mt-10 px-4">
  <WithdrawForm />
  <WithdrawalHistory />
</div>

  );
}

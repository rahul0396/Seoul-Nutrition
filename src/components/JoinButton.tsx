"use client";

import { useStore } from "@/lib/store";
import { Button } from "./ui";

export function JoinButton({ light = false }: { light?: boolean }) {
  const { membershipInCart, setMembershipInCart, setCartOpen, showToast, user } = useStore();
  if (user?.isMember) return <p className="font-bold">You are already a member</p>;
  return (
    <Button
      size="lg"
      variant={light ? "primary" : "member"}
      className={light ? "bg-white! text-ink! hover:bg-white!" : ""}
      onClick={() => { if (!membershipInCart) { setMembershipInCart(true); showToast("Membership added"); } setCartOpen(true); }}
    >
      {membershipInCart ? "In your cart · View cart" : "Start your membership"}
    </Button>
  );
}

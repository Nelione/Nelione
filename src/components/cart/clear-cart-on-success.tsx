"use client";

import { useEffect, useRef } from "react";
import { clearCart } from "@/lib/actions/cart";

/**
 * Vacía la cookie del carrito al montar la página de confirmación.
 * (Un RSC no puede escribir cookies durante el render; este es el único
 * lugar donde necesitamos un efecto de cliente para ello.)
 */
export function ClearCartOnSuccess() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    void clearCart();
  }, []);
  return null;
}

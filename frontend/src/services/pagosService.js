/* =========================================================
   Servicio de pagos con Mercado Pago (residente).
   Habla con el backend (FastAPI), que es quien tiene el Access Token
   de Mercado Pago. El navegador nunca ve esa clave.
========================================================= */

import { supabase } from "../supabase";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function llamar(ruta, cuerpo) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token ?? localStorage.getItem("access_token");
    if (!token) throw new Error("Tu sesión venció. Volvé a iniciar sesión.");

    let res;
    try {
        res = await fetch(`${API_URL}${ruta}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(cuerpo),
        });
    } catch {
        throw new Error("No pudimos conectar con el servidor de pagos. Probá de nuevo en unos minutos.");
    }

    const respuesta = await res.json().catch(() => ({}));
    if (!res.ok) {
        const detalle = typeof respuesta.detail === "string" ? respuesta.detail : "";
        throw new Error(detalle || "No pudimos completar la operación. Probá de nuevo.");
    }
    return respuesta;
}

/** Pide el link de pago de Mercado Pago para una expensa. Devuelve { url, importe, ... } */
export async function iniciarPago(expensaId) {
    const datos = await llamar("/api/pagos/crear-preferencia", { expensa_id: Number(expensaId) });
    if (!datos.url) throw new Error("Mercado Pago no devolvió el link de pago.");
    return datos;
}

/** Al volver de Mercado Pago: el backend le pregunta a Mercado Pago si el pago está aprobado y lo registra. */
export async function confirmarPago(paymentId) {
    return llamar("/api/pagos/confirmar", { payment_id: String(paymentId) });
}

/** "Buscame en Mercado Pago si esta expensa ya se pagó": sirve si el residente no volvió por el botón de Mercado Pago. */
export async function sincronizarPago(expensaId) {
    return llamar("/api/pagos/sincronizar", { expensa_id: Number(expensaId) });
}

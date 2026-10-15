/* =========================================================
   Servicio del Inicio del residente

   Junta en una sola llamada lo que muestra la pantalla de
   inicio, reutilizando los servicios de cada sección:
   expensas, reservas, avisos, reclamos y eventos.

   Cada parte se pide por separado: si una falla, las demás
   se siguen mostrando (esa parte trae { error } en vez de datos).
========================================================= */

import { obtenerExpensasResidente } from "./expensasService";
import { listarReservasActivas, obtenerUsuarioId } from "./reservasService";
import { listarAvisos } from "./avisosService";
import { listarReclamosResidente } from "./reclamosService";
import { listarProximosEventos } from "./eventosService";
import { hoyISO } from "../pages/Residente/Reservas/reservasUtils";

/** De todas las expensas, la que hay que mirar primero. */
function expensaDestacada(expensas) {
    const sinPagar = expensas
        .filter((e) => e.estado !== "Pagada")
        .sort((a, b) => String(a.vencimientoISO).localeCompare(String(b.vencimientoISO)));
    if (sinPagar.length > 0) return { expensa: sinPagar[0], alDia: false };
    return { expensa: expensas[0] ?? null, alDia: true }; // la más reciente (ya está paga)
}

async function pedir(promesa, convertir) {
    try {
        return { datos: convertir(await promesa) };
    } catch (error) {
        console.error("No se pudo cargar una parte del inicio", error);
        return { error: true };
    }
}

export async function cargarInicio() {
    const hoy = hoyISO();
    const usuarioId = await obtenerUsuarioId();

    const [expensas, reservas, avisos, reclamos, eventos] = await Promise.all([
        pedir(obtenerExpensasResidente(), (lista) => ({ ...expensaDestacada(lista), todas: lista })),
        pedir(usuarioId ? listarReservasActivas(usuarioId, hoy) : [], (lista) => lista),
        pedir(listarAvisos(), (lista) => ({
            sinLeer: lista.filter((a) => !a.leido).length,
            importantesSinLeer: lista.filter((a) => !a.leido && a.importancia === "Importante").length,
            ultimos: lista.slice(0, 4),
        })),
        pedir(listarReclamosResidente(), (lista) => ({
            abiertos: lista.filter((r) => r.estado !== "Resuelto").length,
            ultimos: lista.slice(0, 3),
        })),
        pedir(listarProximosEventos(hoy, 20), (lista) => ({
            proximos: lista.slice(0, 4),
            proximaReunion: lista.find((e) => e.tipo === "REUNION") ?? null,
        })),
    ]);

    return { expensas, reservas, avisos, reclamos, eventos };
}

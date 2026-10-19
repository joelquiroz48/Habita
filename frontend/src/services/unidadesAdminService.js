/* Servicio de Unidades (administrador). Usa las funciones de sql/14. */
import { supabase } from "../supabase";

const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

function mensajeError(error, porDefecto) {
    if (!error) return porDefecto;
    if (error.code === "PGRST202") return "Falta instalar sql/14_unidades_admin.sql en Supabase.";
    if (["22023", "23505", "28000", "42501"].includes(error.code)) return error.message;
    return porDefecto;
}

// Busca "gomez" aunque el nombre sea "Gómez" (y viceversa, porque el texto escrito tambien se compara tal cual)
const sinTildes = (t) => `${t} ${t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

function convertir(u) {
    const residentes = u.residentes ?? [];
    const invitaciones = num(u.invitaciones);
    const estado = residentes.length ? "Ocupada" : invitaciones ? "Invitación pendiente" : "Disponible";
    return {
        id: u.id,
        edificioId: u.edificio_id,
        torre: u.edificio_nombre ?? "",
        numero: u.numero ?? "",
        unidad: u.numero ?? "",
        piso: u.piso ?? "",
        ambientes: u.ambientes == null ? null : num(u.ambientes),
        tipo: u.ambientes == null ? "--" : `${u.ambientes} amb.`,
        superficie: u.superficie_m2 == null ? null : num(u.superficie_m2),
        nota: u.nota ?? "",
        residentes,
        responsable: residentes.length
            ? residentes.map((r) => r.nombre).join(", ")
            : "---",
        invitaciones,
        estado,
        expensasPendientes: num(u.expensas_pendientes),
        expensasVencidas: num(u.expensas_vencidas),
        expensasMonto: num(u.expensas_monto),
        reclamosAbiertos: num(u.reclamos_abiertos),
        tieneHistorial: num(u.historial_residentes) + num(u.total_expensas) + num(u.total_reclamos) + invitaciones > 0,
        busqueda: sinTildes(`${u.numero ?? ""} ${residentes.map((r) => r.nombre).join(" ")}`),
    };
}

export async function obtenerUnidadesAdmin() {
    const { data, error } = await supabase.rpc("admin_unidades");
    if (error) throw new Error(mensajeError(error, "No pudimos cargar las unidades."));
    return {
        edificios: (data?.edificios ?? []).map((e) => ({ id: e.id, nombre: e.nombre })),
        unidades: (data?.unidades ?? []).map(convertir),
    };
}

export async function guardarUnidad({ id = null, edificioId, numero, piso, ambientes, superficie, nota }) {
    const { error } = await supabase.rpc("admin_guardar_unidad", {
        p_id: id,
        p_edificio: edificioId,
        p_numero: numero,
        p_piso: piso,
        p_ambientes: ambientes === "" || ambientes == null ? null : Number(ambientes),
        p_superficie: superficie === "" || superficie == null ? null : Number(String(superficie).replace(",", ".")),
        p_nota: nota ?? "",
    });
    if (error) throw new Error(mensajeError(error, "No pudimos guardar la unidad."));
}

export async function eliminarUnidad(id) {
    const { error } = await supabase.rpc("admin_eliminar_unidad", { p_id: id });
    if (error) throw new Error(mensajeError(error, "No pudimos eliminar la unidad."));
}

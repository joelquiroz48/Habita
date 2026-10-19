/* =========================================================
   Servicio de Documentos (residente)

   Tabla:    documento  (los que sube la administración)
   Archivos: Supabase Storage, bucket privado "documentos"

   La seguridad (RLS) hace que el residente solo reciba los
   documentos de SU edificio dirigidos a todos o a su rol.
========================================================= */
import { supabase } from "../supabase";
import { obtenerPeriodoFecha } from "../utils/periodos";

const BUCKET = "documentos";

function formatearFecha(ts) {
    const p = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" })
        .formatToParts(new Date(ts));
    const d = (t) => p.find((x) => x.type === t)?.value ?? "";
    return `${d("day")}/${d("month")}/${d("year")}`;
}

function convertir(f) {
    const fecha = formatearFecha(f.fecha_publicacion);
    return {
        id: f.id,
        nombre: f.nombre,
        categoria: f.categoria || "Otros",
        descripcion: f.descripcion ?? "",
        fecha,
        periodoFecha: obtenerPeriodoFecha(fecha),
        archivoNombre: f.archivo_nombre,
        archivoRuta: f.archivo_ruta,
    };
}

/** Documentos del edificio del residente, del más nuevo al más viejo. */
export async function listarDocumentos() {
    const { data, error } = await supabase
        .from("documento")
        .select("id, nombre, descripcion, categoria, fecha_publicacion, archivo_nombre, archivo_ruta")
        .order("fecha_publicacion", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(convertir);
}

/** Baja el archivo del documento con su nombre original (enlace temporal de 60 s). */
export async function descargarDocumentoArchivo(documento) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(documento.archivoRuta, 60, { download: documento.archivoNombre });
    if (error || !data?.signedUrl) throw new Error("No pudimos descargar el archivo. Probá de nuevo.");
    const a = document.createElement("a");
    a.href = data.signedUrl; a.download = documento.archivoNombre; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
}

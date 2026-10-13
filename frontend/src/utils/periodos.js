export function obtenerPeriodoFecha(fecha) {
    const [fechaCorta] = String(fecha ?? "").split(" ");
    const [, mesTexto, anioTexto] = fechaCorta.split("/");
    const mes = Number(mesTexto);
    const anio = Number(anioTexto);

    if (!mes || mes > 12 || !anio) {
        return "";
    }

    const nombreMes = new Intl.DateTimeFormat("es-AR", {
        month: "long",
    }).format(new Date(anio, mes - 1, 1));

    return `${nombreMes.charAt(0).toLocaleUpperCase("es-AR")}${nombreMes.slice(1)} de ${anio}`;
}

export function obtenerOpcionesPeriodo(items, campo = "periodoFecha") {
    return [...new Set(items.map((item) => item[campo]).filter(Boolean))];
}
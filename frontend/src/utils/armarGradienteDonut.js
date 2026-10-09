export default function armarGradienteDonut(datos, prefijoColor) {
    const total = datos.reduce((acumulado, dato) => acumulado + dato.cantidad, 0);

    if (total === 0) {
        return "conic-gradient(transparent 0% 100%)";
    }

    let acumulado = 0;
    const segmentos = datos.map((dato) => {
        const desde = acumulado;
        acumulado += (dato.cantidad / total) * 100;
        return `var(--${prefijoColor}-${dato.claseColor}) ${desde}% ${acumulado}%`;
    });

    return `conic-gradient(${segmentos.join(", ")})`;
}

/* =========================================================
   Graficos del Dashboard del administrador (sin librerias)

   Son HTML + CSS simples, asi se adaptan solos al ancho de la
   pantalla, se pueden tabular con el teclado y muestran un
   cartel con el detalle al pasar el mouse o enfocar una barra.
========================================================= */

import { useState } from "react";

/** 90000 -> "90 mil"  |  1250000 -> "1,25 M" (para los numeros del eje) */
export function numeroCompacto(valor) {
    if (valor >= 1_000_000) return `${(valor / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 2 })} M`;
    if (valor >= 1_000) return `${(valor / 1_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} mil`;
    return String(valor);
}

/** Maximo "redondo" y marcas del eje: 47500 -> tope 50000 con marcas cada 12500 */
export function escalaBonita(maximo, marcas = 4, entero = false) {
    if (!maximo || maximo <= 0) return { tope: marcas, ticks: Array.from({ length: marcas + 1 }, (_, i) => i) };
    const bruto = maximo / marcas;
    const potencia = 10 ** Math.floor(Math.log10(bruto));
    // Para conteos (reclamos, pagos...) el paso tiene que ser un numero entero
    const multiplos = entero ? [1, 2, 5, 10] : [1, 2, 2.5, 5, 10];
    const paso = multiplos.map((m) => Math.max(entero ? 1 : 0, m * potencia)).find((p) => p >= bruto) ?? bruto;
    const tope = paso * marcas;
    return { tope, ticks: Array.from({ length: marcas + 1 }, (_, i) => paso * i) };
}

/* ---------------------------------------------------------
   Columnas por mes
   - valorDe(fila): numero a graficar
   - formatear(numero): texto completo (cartel)
   - lineasCartel(fila): textos extra del cartel (opcional)
--------------------------------------------------------- */
export function GraficoColumnas({ datos, valorDe, formatear, formatearEje = numeroCompacto, entero = false, lineasCartel, descripcion }) {
    const [activo, setActivo] = useState(null);

    const maximo = Math.max(0, ...datos.map(valorDe));
    const { tope, ticks } = escalaBonita(maximo, 4, entero);
    const sinDatos = maximo === 0;
    const cantidad = datos.length;

    const pct = (valor) => (tope > 0 ? (valor / tope) * 100 : 0);
    const filaActiva = activo !== null ? datos[activo] : null;

    let desplazamiento = "-50%";
    if (activo !== null && activo <= 1) desplazamiento = "-12%";
    if (activo !== null && activo >= cantidad - 2) desplazamiento = "-88%";

    return (
        <div className="adm-grafico" role="group" aria-label={descripcion}>
            <div className="adm-grafico-cuerpo">
                <div className="adm-eje-y" aria-hidden="true">
                    {ticks.map((t) => (
                        <span key={t} style={{ bottom: `${pct(t)}%` }}>{formatearEje(t)}</span>
                    ))}
                </div>

                <div className="adm-area" onMouseLeave={() => setActivo(null)}>
                    {ticks.map((t) => (
                        <div key={t} className="adm-linea-guia" style={{ bottom: `${pct(t)}%` }} aria-hidden="true" />
                    ))}

                    <div className="adm-columnas" style={{ gridTemplateColumns: `repeat(${cantidad}, minmax(0, 1fr))` }}>
                        {datos.map((fila, indice) => {
                            const valor = valorDe(fila);
                            const esUltimo = indice === cantidad - 1;
                            return (
                                <button
                                    key={fila.periodo}
                                    type="button"
                                    className={`adm-columna ${esUltimo ? "actual" : ""} ${activo === indice ? "activa" : ""}`}
                                    aria-label={`${fila.mesLargo}: ${formatear(valor)}`}
                                    onMouseEnter={() => setActivo(indice)}
                                    onFocus={() => setActivo(indice)}
                                    onBlur={() => setActivo(null)}
                                >
                                    <span
                                        className={`adm-barra ${valor === 0 ? "vacia" : ""}`}
                                        style={{ height: valor === 0 ? undefined : `${Math.max(pct(valor), 1.5)}%` }}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    {sinDatos && <p className="adm-grafico-vacio">Todavía no hay datos en este período.</p>}

                    {filaActiva && (
                        <div
                            className="adm-cartel"
                            role="status"
                            style={{
                                left: `${((activo + 0.5) / cantidad) * 100}%`,
                                bottom: `calc(${pct(valorDe(filaActiva))}% + 12px)`,
                                transform: `translateX(${desplazamiento})`,
                            }}
                        >
                            <strong>{filaActiva.mesLargo}</strong>
                            <span>{formatear(valorDe(filaActiva))}</span>
                            {lineasCartel?.(filaActiva).map((linea) => <small key={linea}>{linea}</small>)}
                        </div>
                    )}
                </div>
            </div>

            <div className="adm-grafico-pie">
                <span className="adm-eje-y-hueco" aria-hidden="true" />
                <div className="adm-etiquetas-x" style={{ gridTemplateColumns: `repeat(${cantidad}, minmax(0, 1fr))` }} aria-hidden="true">
                    {datos.map((fila, indice) => (
                        <span key={fila.periodo} className={indice === cantidad - 1 ? "actual" : ""}>{fila.mes}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------
   Barra apilada con leyenda (partes de un total)
   segmentos: [{ nombre, cantidad, color }]
--------------------------------------------------------- */
export function BarraApilada({ segmentos, etiqueta }) {
    const total = segmentos.reduce((suma, s) => suma + s.cantidad, 0);

    return (
        <div className="adm-apilada">
            {total === 0 ? (
                <div className="adm-apilada-barra vacia" role="img" aria-label={`${etiqueta}: sin datos`} />
            ) : (
                <div className="adm-apilada-barra" role="img" aria-label={`${etiqueta}: ${segmentos.map((s) => `${s.nombre} ${s.cantidad}`).join(", ")}`}>
                    {segmentos.filter((s) => s.cantidad > 0).map((s) => (
                        <span key={s.nombre} style={{ flexGrow: s.cantidad, background: s.color }} title={`${s.nombre}: ${s.cantidad}`} />
                    ))}
                </div>
            )}

            <ul className="adm-leyenda">
                {segmentos.map((s) => (
                    <li key={s.nombre}>
                        <i style={{ background: s.color }} aria-hidden="true" />
                        <span>{s.nombre}</span>
                        <strong>{s.cantidad}</strong>
                        <small>{total > 0 ? `${Math.round((s.cantidad / total) * 100)}%` : "0%"}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ---------------------------------------------------------
   Barras horizontales (ranking de categorias)
   datos: [{ nombre, cantidad }]
--------------------------------------------------------- */
export function BarrasHorizontales({ datos, etiqueta }) {
    const maximo = Math.max(1, ...datos.map((d) => d.cantidad));

    return (
        <ul className="adm-ranking" aria-label={etiqueta}>
            {datos.map((d) => (
                <li key={d.nombre}>
                    <span className="adm-ranking-nombre">{d.nombre}</span>
                    <span className="adm-ranking-pista" aria-hidden="true">
                        <span style={{ width: `${(d.cantidad / maximo) * 100}%` }} />
                    </span>
                    <strong>{d.cantidad}</strong>
                </li>
            ))}
        </ul>
    );
}

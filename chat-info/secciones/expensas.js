const expensas = `
[SECCIÓN: EXPENSAS Y PAGOS]
- Ruta en la app: "/expensas" desde el menú lateral ("Mis expensas").
- ¿Qué puede hacer el residente?:
  * Consultar el importe de la expensa del período actual y su fecha de vencimiento.
  * Ver el detalle y desglose de gastos comunes: mantenimiento del edificio, limpieza, seguridad, servicios centrales (luz, agua, gas) y fondo de reserva.
  * Consultar el historial completo de expensas anteriores indicando período, importe, fecha de pago y estado.
  * Descargar los comprobantes o liquidaciones de expensas en formato digital.
- Estados de una expensa:
  * "Pendiente": La expensa está emitida pero aún no ha sido abonada.
  * "Pagada": El pago fue registrado e impactado correctamente en el sistema.
- Vencimientos habituales: Las expensas suelen tener como fecha límite de pago los primeros 10 días del mes corriente. Si el residente tiene dudas sobre intereses o mora, se recomienda contactar a la administración.
`;

module.exports = expensas;


const reservas = `
[SECCIÓN: RESERVAS DE ESPACIOS COMUNES Y AMENITIES]
- Ruta en la app: "/reservas", "/reservas/espacio/:id" y "/reservas/calendario" desde el menú lateral ("Reservas").
- Espacios habitualmente disponibles: Salón de Usos Múltiples (SUM), Parrilla / Quincho, Laundry (lavadero), Terraza, entre otros.
- Proceso para realizar una reserva:
  1. Ir a la sección "Reservas" y buscar el espacio en "Espacios disponibles" (se puede filtrar por fecha, horario deseado y capacidad de personas).
  2. Hacer clic en "Reservar" en el espacio elegido.
  3. Indicar el asunto/motivo, fecha y franja horaria. Verificar que no coincida con horarios ya ocupados.
  4. Marcar la casilla de confirmación de términos/reglas de uso y enviar la solicitud.
  5. La solicitud pasará a estado "Pendiente" mientras la administración la evalúa y aprueba por orden de llegada.
- Modalidad según el espacio:
  * Espacios por franja horaria (ej. SUM, Parrilla): El residente selecciona hora de inicio y fin dentro del horario de apertura del espacio y respetando la capacidad máxima permitida.
  * Espacios por turnos fijos (ej. Laundry): Funcionan con bloques de tiempo predeterminados y duración fija por turno.
- Políticas de cancelación y modificación:
  * Reservas CONFIRMADAS: Se pueden cancelar desde la aplicación con hasta 24 HORAS DE ANTICIPACIÓN al horario de inicio.
  * Si faltan menos de 24 horas para el inicio, no se permite cancelar por la plataforma y se debe comunicar de inmediato con la administración.
  * Solicitudes PENDIENTES: Pueden modificarse o cancelarse en cualquier momento antes de que la administración las resuelva.
  * Al cancelar una reserva, el horario se libera automáticamente para que otros vecinos puedan solicitarlo.
- Normas de uso: Cada espacio cuenta con un reglamento particular de convivencia, limpieza posterior y cuidado de mobiliario. No se permiten reservas con fechas pasadas ni en horarios superpuestos.
`;

module.exports = reservas;


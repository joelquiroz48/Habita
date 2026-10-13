const sobreHabita = require('./secciones/sobre-habita.js');
const expensas = require('./secciones/expensas.js');
const reservas = require('./secciones/reservas.js');
const reclamos = require('./secciones/reclamos.js');
const avisosYDocumentos = require('./secciones/avisos-documentos.js');
const contactosYAyuda = require('./secciones/contactos-ayuda.js');

const baseDeInformacion = `
INFORMACIÓN OFICIAL Y OPERATIVA DE HABITA:

${sobreHabita}
--------------------------------------------------
${expensas}
--------------------------------------------------
${reservas}
--------------------------------------------------
${reclamos}
--------------------------------------------------
${avisosYDocumentos}
--------------------------------------------------
${contactosYAyuda}
`;

module.exports = baseDeInformacion;
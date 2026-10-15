/* =========================================================
   Textos legales de Habita.
   IMPORTANTE: es un texto base para el proyecto. Antes de usar
   Habita con consorcios reales, que lo revise una persona
   con formación legal.
========================================================= */

export const FECHA_ACTUALIZACION = "15 de octubre de 2026";

export const DOCUMENTOS_LEGALES = {
    terminos: {
        ruta: "/terminos",
        titulo: "Términos y condiciones",
        resumen: "Reglas para usar Habita, la plataforma de gestión de tu consorcio.",
        secciones: [
            {
                titulo: "1. Qué es Habita",
                parrafos: [
                    "Habita es una plataforma web que facilita la comunicación y la gestión entre la administración de un consorcio y sus residentes: consulta y pago de expensas, reservas de espacios comunes, reclamos, avisos y documentos.",
                    "Al crear una cuenta o usar la plataforma aceptás estos términos. Si no estás de acuerdo con alguno, te pedimos que no la uses.",
                ],
            },
            {
                titulo: "2. Tu cuenta",
                parrafos: [
                    "Para usar Habita necesitás una cuenta vinculada a una unidad de un edificio. Los datos que cargues deben ser verdaderos y estar actualizados.",
                    "Sos responsable de mantener la confidencialidad de tu contraseña y de la actividad realizada desde tu cuenta. Si sospechás un uso no autorizado, cambiá tu contraseña desde Mi perfil o cerrá todas las sesiones desde Configuración.",
                ],
            },
            {
                titulo: "3. Uso adecuado",
                parrafos: [
                    "Te comprometés a usar Habita de buena fe y a no:",
                ],
                items: [
                    "Intentar acceder a información de otras personas o de otros edificios.",
                    "Cargar contenido ofensivo, falso o que viole derechos de terceros.",
                    "Alterar, sobrecargar o intentar vulnerar el funcionamiento de la plataforma.",
                ],
            },
            {
                titulo: "4. Expensas, pagos y reservas",
                parrafos: [
                    "Los importes, vencimientos y conceptos de las expensas son definidos por la administración del consorcio. Habita los muestra, pero no los determina.",
                    "Los pagos en línea se procesan mediante Mercado Pago, que tiene sus propios términos y condiciones. Habita no almacena los datos de tu tarjeta.",
                    "Las reservas de espacios comunes están sujetas a disponibilidad y al reglamento del edificio.",
                ],
            },
            {
                titulo: "5. Reclamos, avisos y documentos",
                parrafos: [
                    "Los reclamos que envíes serán recibidos por la administración, que decide cómo y cuándo resolverlos. Habita no garantiza plazos de respuesta.",
                    "Los avisos y documentos publicados por la administración tienen carácter informativo.",
                ],
            },
            {
                titulo: "6. Disponibilidad del servicio",
                parrafos: [
                    "Trabajamos para que Habita esté disponible de forma continua, pero pueden existir interrupciones por mantenimiento o causas ajenas a nuestro control. Podemos modificar o mejorar funciones en cualquier momento.",
                ],
            },
            {
                titulo: "7. Limitación de responsabilidad",
                parrafos: [
                    "Habita es una herramienta de apoyo. No somos parte de la relación entre el consorcio y sus residentes ni respondemos por las decisiones de la administración.",
                ],
            },
            {
                titulo: "8. Cambios en estos términos",
                parrafos: [
                    "Podemos actualizar estos términos. Cuando haya cambios importantes te lo vamos a informar dentro de la plataforma. Seguir usando Habita después de un cambio implica que lo aceptás.",
                ],
            },
            {
                titulo: "9. Contacto",
                parrafos: [
                    "Si tenés dudas sobre estos términos, podés escribirnos desde Configuración > Reportar un problema o consultar a la administración de tu consorcio.",
                ],
            },
        ],
    },

    privacidad: {
        ruta: "/privacidad",
        titulo: "Política de privacidad",
        resumen: "Qué datos tuyos usa Habita, para qué y cómo los cuidamos.",
        secciones: [
            {
                titulo: "1. Qué datos recopilamos",
                parrafos: ["Para que Habita funcione, guardamos:"],
                items: [
                    "Datos de tu cuenta: nombre, correo electrónico, teléfono y foto de perfil (opcional).",
                    "Datos de tu vínculo con el edificio: unidad, edificio y rol (propietario, inquilino u ocupante).",
                    "Tu actividad en la plataforma: expensas y pagos, reservas, reclamos (con sus archivos adjuntos), avisos leídos y preferencias de notificación.",
                ],
            },
            {
                titulo: "2. Para qué los usamos",
                parrafos: [
                    "Usamos tus datos para identificarte, mostrarte la información de tu unidad, permitirte pagar, reservar y reclamar, y avisarte lo que elegiste recibir. No vendemos tus datos ni los usamos para publicidad.",
                ],
            },
            {
                titulo: "3. Quién puede ver tu información",
                parrafos: [
                    "La administración de tu edificio puede ver los datos necesarios para gestionar el consorcio (por ejemplo, tus reclamos, reservas y estado de expensas).",
                    "Otros residentes no pueden ver tus datos personales, tus expensas ni tus reclamos. Cada persona accede únicamente a lo que le corresponde.",
                ],
            },
            {
                titulo: "4. Servicios de terceros",
                parrafos: [
                    "Habita utiliza proveedores para funcionar: infraestructura de base de datos y almacenamiento de archivos, y Mercado Pago para procesar pagos. Estos servicios reciben solo los datos necesarios para cumplir su función y tienen sus propias políticas de privacidad.",
                ],
            },
            {
                titulo: "5. Cuánto tiempo guardamos tus datos",
                parrafos: [
                    "Conservamos tu información mientras tu cuenta esté activa y por el tiempo que la administración necesite para fines de gestión y registros del consorcio. Después, se elimina o se anonimiza.",
                ],
            },
            {
                titulo: "6. Tus derechos",
                parrafos: [
                    "Conforme a la Ley 25.326 de Protección de los Datos Personales de la República Argentina, podés acceder a tus datos, rectificarlos o pedir su supresión. Podés actualizar tu nombre, teléfono y foto desde Mi perfil. Para otros pedidos, escribinos desde Configuración > Reportar un problema.",
                    "La Agencia de Acceso a la Información Pública es el órgano de control de la ley 25.326 y atiende denuncias y reclamos por incumplimientos de la normativa de protección de datos personales.",
                ],
            },
            {
                titulo: "7. Seguridad",
                parrafos: [
                    "Aplicamos medidas técnicas para proteger tu información, como el acceso con contraseña, el aislamiento de datos entre edificios y usuarios, y el almacenamiento privado de archivos. Ningún sistema es infalible: te recomendamos usar una contraseña única y cerrar sesión en equipos compartidos.",
                ],
            },
            {
                titulo: "8. Cambios en esta política",
                parrafos: [
                    "Si cambiamos esta política, actualizaremos la fecha de arriba y, si el cambio es importante, te lo avisaremos dentro de la plataforma.",
                ],
            },
        ],
    },
};

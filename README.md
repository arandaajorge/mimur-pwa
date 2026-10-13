# MiMuR PWA Starter

## Incluye
- Interfaz adaptable a celular y computadora.
- Seis perfiles de músico ficticios con filtros.
- Formulario de interés de músicos y solicitud de evento.
- Manifest PWA, icono y service worker con caché básica.
- Esquema SQL de referencia para Supabase.

## Limitaciones actuales
Este es un prototipo funcional local, **no una plataforma multiusuario**. Los perfiles son demostrativos. Los formularios se guardan en localStorage en el dispositivo actual; no se envían al servidor, no hay autenticación ni pagos. El esquema SQL no conecta el frontend y sus políticas RLS están incompletas intencionalmente.

## Ejecutar en Windows
1. Descomprime el ZIP.
2. Abre PowerShell dentro de esta carpeta.
3. Con Python 3 instalado, ejecuta: `py -m http.server 8000`
4. Abre `http://localhost:8000`.

Abrir el HTML con doble clic permite ver la interfaz, pero instalación PWA y service worker requieren `localhost` o HTTPS.

## Instalar en Android
Despliega los archivos en un hosting HTTPS, abre la URL en Chrome y usa el menú para instalar la aplicación o añadirla a pantalla de inicio. Este paquete no crea ni incluye una URL pública.

## Backend siguiente
1. Crea un proyecto en Supabase.
2. Revisa `supabase_schema.sql` y ejecútalo en un proyecto nuevo.
3. Diseña políticas RLS para clientes, músicos y administradores y pruébalas con cuentas separadas.
4. Conecta el frontend a Supabase con URL y clave pública `anon`.
5. Nunca expongas `service_role` ni secretos en el navegador.
6. Sustituye los datos de demo y localStorage por operaciones autenticadas.
7. Define cancelaciones, reembolsos, disputas, privacidad y términos antes de abrir al público.

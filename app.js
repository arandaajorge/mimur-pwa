MiMuR — CORRECCIONES DE FOLIOS EN app.js
=======================================
Este archivo contiene los cambios exactos para el código compartido.
No altera la lógica de reservas ni activa cobros reales.

1) EN cargarContratacionesCliente(), CAMBIA el SELECT de event_requests:

ANTES:
.select('id,event_type,event_date,zone,genre,duration_minutes,budget_mxn,status,created_at,offers(id,status,musician_id,customer_total_mxn),bookings(id,accepted_offer_id,agreed_total_mxn,status,payment_mode,booking_payments(id,payment_type,amount_mxn,status,paid_at))')

DESPUÉS:
.select('id,event_type,event_date,zone,genre,duration_minutes,budget_mxn,status,created_at,offers(id,status,musician_id,customer_total_mxn),bookings(id,booking_folio,accepted_offer_id,agreed_total_mxn,status,payment_mode,payment_deadline_at,booking_payments(id,payment_type,amount_mxn,status,paid_at))')

2) EN cargarContratacionesCliente(), CAMBIA:

ANTES:
line(div,'Folio de reserva: '+r.id);

DESPUÉS:
line(div,'Folio de reserva: '+(r.booking_folio||'Pendiente de consultar'));

3) EN el botón Confirmar contratación de cargarContratacionesCliente(), CAMBIA:

ANTES:
alert('Contratación registrada. Folio: '+r.data+'\nPago pendiente.');
await cargarContratacionesCliente();

DESPUÉS:
const reservaId = typeof r.data === 'string' ? r.data : r.data?.id;
if (!reservaId) throw new Error('La contratación se registró, pero no se recibió el identificador de reserva. Actualiza tus solicitudes antes de volver a intentar.');
const {data:reservaNueva,error:folioError}=await supabaseClient
  .from('bookings')
  .select('booking_folio,payment_deadline_at')
  .eq('id',reservaId)
  .single();
if(folioError){
  console.error('No se pudo consultar el folio:',folioError);
  alert('Contratación registrada. Actualiza tus solicitudes para consultar el folio oficial. Pago pendiente.');
}else{
  alert('Contratación registrada. Folio: '+(reservaNueva.booking_folio||'Pendiente de consultar')+'\nPago pendiente.');
}
await cargarContratacionesCliente();

IMPORTANTE: el código original ejecuta el RPC ANTES de este bloque. Si falla la consulta posterior, NO vuelvas a pulsar Confirmar contratación; actualiza la pantalla.

4) EN cargarSolicitudesMusico(), CAMBIA el SELECT de offers:

ANTES:
.select('id,event_request_id,musician_price_mxn,customer_total_mxn,status,musician_note,created_at,bookings(id,accepted_offer_id,status,agreed_total_mxn,musician_payout_mxn),event_requests!offers_event_request_id_fkey(event_type,event_date,zone,genre,duration_minutes,budget_mxn,details,status)')

DESPUÉS:
.select('id,event_request_id,musician_price_mxn,customer_total_mxn,status,musician_note,created_at,bookings(id,booking_folio,accepted_offer_id,status,agreed_total_mxn,musician_payout_mxn),event_requests!offers_event_request_id_fkey(event_type,event_date,zone,genre,duration_minutes,budget_mxn,details,status)')

5) EN cargarSolicitudesMusico(), CAMBIA:

ANTES:
line(p,'Folio: '+r.id);

DESPUÉS:
line(p,'Folio: '+(r.booking_folio||'Pendiente de consultar'));

6) RECOMENDADO: mostrar la fecha límite de pago en el resumen del cliente.
En panelPagos(r), justo después de:
line(p,'Total contratado: '+money(r.agreed_total_mxn));

AGREGA:
if(r.payment_deadline_at && r.status==='pending_confirmation'){
  line(p,'Fecha límite para pagar: '+fecha(r.payment_deadline_at));
}

NOTAS:
- booking_folio es el folio comercial; id es el identificador UUID interno.
- El acceso SELECT a bookings debe permitir al cliente consultar su propia reserva mediante RLS.
- La consulta de folio posterior al RPC no modifica el pago ni la reserva.
- No habilita Mercado Pago ni pagos reales.
- Si el RPC devolvería una estructura diferente a UUID o {id}, ajustar según la respuesta real.

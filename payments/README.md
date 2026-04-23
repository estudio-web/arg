# PagoSimple SaaS

Sistema multi-tenant para cobrar por transferencia en Argentina, compatible con GitHub Pages, Firebase Auth, Firestore por CDN, HTML, CSS y JavaScript puro.

## Archivos

```
landing.html      Pagina comercial y solicitud de cuenta
login.html        Acceso con email/password
register.html     Solicitud publica, no crea usuarios Auth
dashboard.html    Panel del tenant
superadmin.html   Panel global del superadmin
payments.html     Pago publico con ?u=USER_ID&p=PAYMENT_ID
admin.html        Redireccion legacy a dashboard.html
app.js            Configuracion y helpers compartidos
styles.css        Estilos globales
firestore.rules   Reglas de seguridad
```

## Firestore

```
users/{userId}
users/{userId}/config/main
users/{userId}/payments/{paymentId}
users/{userId}/orders/{orderId}
users/{userId}/plan/current
accountRequests/{requestId}
```

## Planes

```
trial  14 dias, 1 link maximo
plan1  $15.000 ARS, hasta 10 links
plan2  $25.000 ARS, hasta 50 links
```

## Bootstrap Superadmin

1. Habilita Firebase Auth con email/password.
2. Crea manualmente el usuario superadmin en Firebase Auth.
3. En Firestore crea `users/{SUPERADMIN_UID}` con:

```json
{
  "role": "superadmin",
  "active": true,
  "email": "admin@tu-dominio.com",
  "nombre": "Super",
  "apellido": "Admin",
  "plan": "plan2"
}
```

4. Publica `firestore.rules`.
5. Entra a `superadmin.html` y crea usuarios tenant manualmente.

Sin backend ni Firebase Functions, el alta manual de usuarios se hace desde `superadmin.html` usando una segunda instancia Auth en el navegador. El formulario publico solo guarda solicitudes en `accountRequests`.

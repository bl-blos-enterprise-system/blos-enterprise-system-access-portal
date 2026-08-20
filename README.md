# BES Access Portal

La raíz pública muestra la biblioteca documental completa de los 14 pilares BES sin exigir una cuenta. El acceso administrativo continúa protegido mediante Supabase Auth.
Portal de acceso del BLOS Enterprise System para Best Linen.

## Seguridad

- Autenticación real mediante Supabase; no existen credenciales de demostración en el repositorio.
- Alta de usuarios únicamente desde el módulo del propietario.
- Contraseña temporal de un solo uso con vencimiento de 24 a 72 horas.
- Cambio obligatorio en el primer acceso bajo la política `BES-SEC-PWD-v1`.
- MFA obligatorio para roles privilegiados.
- Perfiles, membresías y datos institucionales protegidos mediante RLS y funciones autenticadas.

La clave incluida en `assets/js/supabase-config.js` es publicable y apta para navegador. Nunca debe agregarse una clave `service_role` o secreta al repositorio.

## Alcance BES

El portal conserva los 14 pilares, las 22 secciones estándar por pilar, el mapa organizacional, la relación Odoo ↔ BL RACKS y el estándar documental de diez secciones.

Universidad Best Linen incluye cuatro unidades formativas, avance individual persistente, evaluación de ocho reactivos calificada en PostgreSQL, historial y reconocimientos derivados en servidor. Los roles con alcance de cohorte pueden consultar el tablero de personal destacado; cada usuario conserva acceso a su propio avance mediante RLS.

La biblioteca documental se obtiene de la función autenticada `bes-document-library`. Los metadatos y activos no se incorporan como archivos públicos de GitHub Pages. El inventario consolidado `BES-04-KDX-001-v1.0` se carga desde esa misma biblioteca y conserva su estado de aprobación explícito.

La raíz pública obtiene el corte vigente mediante `bes-public-catalog`. Los activos HTML publicados por Supabase se recuperan como texto y se reconstruyen localmente con MIME `text/html` antes de abrirse, evitando que el navegador muestre el código fuente.

La migración `supabase/migrations/20260820_ubl_functional_portal.sql` registra el contrato de UBL. El cliente nunca envía puntuaciones ni reconocimientos válidos: `submit_ubl_assessment` calcula ambos valores en servidor.

## Validación local

```powershell
node --check assets/js/app.js
node tests/smoke.mjs
```

Sirve la raíz del repositorio mediante HTTP para la prueba de navegador. Abrir `index.html` como archivo local no es compatible con la autenticación.

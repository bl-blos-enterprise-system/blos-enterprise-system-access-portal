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

La biblioteca documental se obtiene de la función autenticada `bes-document-library`. Los metadatos y activos no se incorporan como archivos públicos de GitHub Pages. El inventario consolidado `BES-04-KDX-001-v1.0` se carga desde esa misma biblioteca y conserva su estado de aprobación explícito.

## Validación local

```powershell
node --check assets/js/app.js
node tests/smoke.mjs
```

Sirve la raíz del repositorio mediante HTTP para la prueba de navegador. Abrir `index.html` como archivo local no es compatible con la autenticación.

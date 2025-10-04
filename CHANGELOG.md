# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

## Entrega 1

### Funcionalidades nuevas
- Componentes de autenticación: Login, Register y PasswordRecovery.
- Ruta /dashboard solo se puede acceder si el usuario está logueado. caso contrario, redirije al /login.
- Funcionalidad de mostrar/ocultar contraseña (botón "ojito") en las tres rutas de autenticación.
- Redireccionamiento entre páginas de login, register y recovery.
- Estilos responsivos para dispositivos móviles.

### Arreglos
- Botón "ojito" ahora funciona correctamente en dispositivos móviles. El estado se mantiene hasta que el usuario vuelve a hacer click en el ojito.
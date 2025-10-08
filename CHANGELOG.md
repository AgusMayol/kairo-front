# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

## v2.0.0

### Arreglos
- Bug--001 (TC--010) — Sprint_2: Ícono “ojito” se duplica en Edge al tipear. Ahora, el botón de "ojito" nativo de Microsoft Edge está oculto por defecto.
- BUG-0006 (TC-0013), BUG-0008 (TC-0026), BUG-0009 (TC-0027): Registro: “Email o username ya en uso” cuando no existen. Ahora, el registrarse con credenciales nuevas verifica correctamente que no exista el usuario.
-BUG-0007 (TC-0025): Registro: permite username duplicado. 
-BUG-SIN-DOCUMENTAR-0001: Recovery: mobile: Ojito de confirmar nueva contraseña modifica el estado visible de nueva contraseña. Ahora, cada ojito modifica el campo correcto. 

## v1.0.0

### Funcionalidades nuevas
- Componentes de autenticación: Login, Register y PasswordRecovery.
- Ruta /dashboard solo se puede acceder si el usuario está logueado. caso contrario, redirije al /login.
- Funcionalidad de mostrar/ocultar contraseña (botón "ojito") en las tres rutas de autenticación.
- Redireccionamiento entre páginas de login, register y recovery.
- Estilos responsivos para dispositivos móviles.

### Arreglos
- Botón "ojito" ahora funciona correctamente en dispositivos móviles. El estado se mantiene hasta que el usuario vuelve a hacer click en el ojito.
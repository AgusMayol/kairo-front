# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

## v3.0.0

### Funcionalidades nuevas
- Pestaña "Solo prioridades personales": Permite visualizar unicamente tareas marcadas con una estrella.
- Panel de ordenamiento personalizado: Permite ordenar las tareas tanto en el "tablero" como en "solo prioridades personales" por prioridad, fecha de vencimiento, fecha de creación. La selección persiste en el mismo navegador.
- Buscador inteligente: Barra de búsqueda que permite filtrar en tiempo real tanto en el "tablero" como en "solo prioridades personales" por título, descripción y usuario asignador. Funciona en conjunto con el ordenamiento personalizado.

### Cambios
- Se optimizó la vista mobile para que los tableros se vean de manera horizontal.
- Se omtimizó la vista desktop al momento de editar una tarea, para que esta ocupe correctamente la altura de la pantalla.



## v2.0.0

### Funcionalidades nuevas
- Módulo Tablero funcional, dividido en tres columnas (Pendiente, En progreso y Completadas).
- Tareas en forma de tarjetas, cada una con los detalles de la tarea y con botones de Prioridad (Estrella) y Ver detalles (Ojo).
- Alerta de "Modificaiones guardadas" al modificar el estado o la nota de una tarea.
- Alerta de "No se detectaron modificaciones" si se presiona el botón de "Guardar cambios" y el usuario no realizó modificaciones.
- Modal para realizar cambios a cada tarea.
- Barra lateral con botones de Tablero, Reportes (no funcional) y Prioridades (no funcional).
- Barra lateral en mobile que se acciona a través de un botón.
- Estado de "Cargando tareas" al acceder al tablero
- Estado de "Tareas vacías" si el usuario no cuenta con tareas en una columna.
- Responsive en todo el tablero.

### Cambios
- Nuevo componente para alertas modernas.
- Botón de Cerrar sesión desplazado a la barra lateral.

### Arreglos
- Bug--001 (TC--010) — Sprint_2: Ícono “ojito” se duplica en Edge al tipear. Ahora, el botón de "ojito" nativo de Microsoft Edge está oculto por defecto.
- BUG-0006 (TC-0013), BUG-0008 (TC-0026), BUG-0009 (TC-0027): Registro: “Email o username ya en uso” cuando no existen. Ahora, el registrarse con credenciales nuevas verifica correctamente que no exista el usuario.
- BUG-0007 (TC-0025): Registro: permite username duplicado. Ahora, el registrarse con credenciales nuevas verifica correctamente que no exista el usuario.
- BUG-SIN-DOCUMENTAR-0001: Recovery: mobile: Ojito de confirmar nueva contraseña modifica el estado visible de nueva contraseña. Ahora, cada ojito modifica el campo correcto. 
- BUG-0002 (TC-0004): No permite iniciar sesión con credenciales válidas. Ahora, se agregaron los usuarios de prueba por defecto.
- BUG-0001 (TC-0001), BUG-0003 (TC-0002), BUG-0004 (TC-0002): Campo de identificación solo acepta email (debe aceptar email o usuario). Ahora, el login permite identificarse con ambos campos.
- BUG-0010 (TC-0010), BUG-0011 (TC-0010), BUG-0005 (TC-0026): Mensajería de error en login prioriza “email faltante” y no valida password. Ahora, el register verifica los campos de username y password.





## v1.0.0

### Funcionalidades nuevas
- Componentes de autenticación: Login, Register y PasswordRecovery.
- Ruta /dashboard solo se puede acceder si el usuario está logueado. caso contrario, redirije al /login.
- Funcionalidad de mostrar/ocultar contraseña (botón "ojito") en las tres rutas de autenticación.
- Redireccionamiento entre páginas de login, register y recovery.
- Estilos responsivos para dispositivos móviles.

### Arreglos
- Botón "ojito" ahora funciona correctamente en dispositivos móviles. El estado se mantiene hasta que el usuario vuelve a hacer click en el ojito.
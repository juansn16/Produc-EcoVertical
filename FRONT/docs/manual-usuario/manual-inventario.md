# Inventario del Huerto

Administra herramientas, semillas, fertilizantes y otros materiales del huerto. Aquí verás cómo crear ítems, actualizar stock, registrar usos, consultar el historial y compartir ítems con otros usuarios.

---

## 1) Crear o editar un ítem
Pulsa **Agregar Ítem** para abrir el formulario. Para editar, usa el botón **Editar** en la tarjeta del ítem.

Campos del formulario:
- **Nombre***: nombre del ítem. Ej: “Semillas de Tomate”.
- **Descripción**: detalles del producto o uso.
- **Categoría***: selecciona la categoría (Semillas, Sensores, Sustratos, etc.).
- **Stock Actual***: unidades disponibles al momento de crear/editar.
- **Stock Mínimo**: umbral de alerta para “Bajo stock”.
- **Precio Estimado**: costo aproximado (opcional).
- **Ubicación en Almacén**: dónde se guarda (ej. Estante A-1).
- **Proveedor**: selecciona un proveedor registrado o deja “Desconocido”.
- **URL de Imagen**: enlace a una imagen pública del ítem (opcional).

Al guardar, el ítem aparecerá en el grid. Si no ves “Agregar Ítem”, consulta con tu administrador/técnico (requiere permisos).

---

## 2) Acciones en cada ítem
Cada tarjeta de inventario muestra acciones según tus permisos:

- **Editar**: modifica los datos del ítem.
- **Stock**: ajusta cantidades (entradas/salidas controladas por stock). Úsalo para correcciones, recepciones, inventarios físicos o ajustes.
- **Usar**: registra un uso/consumo del ítem. Úsalo cuando una parte del stock se utiliza en el huerto.
- **Historial**: abre el historial de uso y comentarios asociados al ítem.
- **Eliminar**: borra el ítem (solo si eres dueño, admin o técnico, o si tienes permiso asignado completo).

Notas:
- El botón **Usar** solo aparece si hay stock disponible y tienes permiso de uso.
- “Bajo stock” y “Sin stock” se calculan con base en el Stock Mínimo y las existencias actuales.

---

## 3) Registrar uso (Usar)
Al pulsar **Usar**:
1. Indica la **cantidad a consumir**.
2. Confirma el registro.
3. El sistema descuenta del stock y guarda el movimiento en el **Historial**.

Usa esta opción para movimientos operativos (aplicaciones de fertilizante, entrega de herramientas, etc.). Para correcciones o ingresos, utiliza **Stock**.

---

## 4) Historial
El **Historial** muestra los comentarios y usos relacionados con el ítem. Todos pueden verlo; las opciones de editar/eliminar comentarios dependen de permisos.

¿Qué encontrarás?
- Fecha, autor y detalle de cada uso/comentario.
- Controles para editar/eliminar comentarios si tienes permiso.

---

## 5) Búsqueda, filtros y paginación
En la parte superior puedes:
- **Buscar** por nombre o descripción.
- Aplicar **filtros** y ordenamientos.
- Limpiar filtros con “Limpiar Filtros”.
- Navegar con **paginación** cuando hay muchos ítems.

---

## 6) Compartir un ítem con otros usuarios (Gestión de Comentarios / Permisos)
Además del uso interno, puedes decidir qué usuarios pueden trabajar con tus ítems.

- Botón en la cabecera: **Gestión de Comentarios**. Abre un panel para elegir el ítem cuyo “compartir”/permisos quieres gestionar.
- Selecciona el ítem y luego se abrirá el gestor de permisos del ítem.

En el gestor de permisos del ítem (solo el dueño):
- **Asignar usuario**: permite compartir el ítem con otra persona del mismo condominio/ubicación.
- **Tipo de permiso**: “completo” (incluye editar, usar, ver historial y eliminar, según configuración del sistema).
- **Revocar permiso**: quita acceso a un usuario previamente asignado.

Cuándo usarlo:
- Para que otro residente pueda **Usar** o **Actualizar Stock** de un ítem que tú creaste.
- Para permitir a técnicos/colaboradores gestionar ciertos ítems sin darles control total del inventario.

Importante:
- Administradores y técnicos ya suelen tener permisos elevados por rol.
- Los residentes solo pueden compartir los ítems que han creado.

---

## 7) Consejos y solución de problemas
- No veo los botones “Stock” o “Usar”: puede faltar permiso. Pide al dueño del ítem que te comparta acceso o consulta a un administrador.
- No puedo seleccionar proveedor: espera a que cargue la lista o ingresa el ítem y asócialo después.
- Los avisos de “Bajo stock” no cambian: revisa el **Stock Mínimo** del ítem y actualiza el stock real.
- La imagen no se ve: asegúrate de que la **URL** sea pública y directa a una imagen.

Con esto podrás administrar tu inventario, registrar consumos y compartir ítems con quien corresponda.

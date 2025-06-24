
# 🎓 Sistema de Gestión Académico - Documentación General

Este proyecto es una aplicación web para gestionar entidades académicas: **estudiantes**, **carreras** y **categorías**.

---

## 📁 Estructura del Proyecto

```plaintext
📦 registro_alumnos/
├── index.html           → Página de inicio
├── estudiantes.html     → Gestión de estudiantes
├── carreras.html        → Gestión de carreras
├── categorias.html      → Gestión de categorías
│
├── styles.css           → Estilos generales (CSS)
├── app.js               → Lógica del frontend (JavaScript)
│
└── backend/
    ├── index.js         → Servidor principal (Node.js + Express)
    └── routes/
        ├── careers.js     → Rutas para carreras
        ├── students.js    → Rutas para estudiantes
        └── categories.js  → Rutas para categorías
```

---

## 🔁 Flujo de Funcionamiento

### 1. Inicio (`index.html`)

- Página de bienvenida con navegación a:
  - Gestión de Estudiantes
  - Gestión de Carreras
  - Gestión de Categorías

---

### 2. Estudiantes (`estudiantes.html`)

Permite:

- Registrar un nuevo estudiante (nombre + carrera).
- Buscar estudiante por ID.
- Buscar por carrera.
- Eliminar estudiantes.

---

### 3. Carreras (`carreras.html`)

Permite:

- Registrar carrera (nombre, categoría, duración, tipo).
- Buscar por ID.
- Ver todas las carreras (DataTable con acciones).
- Eliminar desde la tabla.

---

### 4. Categorías (`categorias.html`)

Permite:

- Registrar nueva categoría.
- Buscar por ID.
- Eliminar por ID.

---

## 🌐 Comunicación Frontend ↔ Backend

### 🔗 Headers

Todas las solicitudes utilizan `fetch` y requieren autenticación:

```js
const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer 12345ABCDEF"
};
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend

- HTML5
- CSS3 con animaciones
- JavaScript (Vanilla)
- DataTables
- SweetAlert2

### Backend

- Node.js + Express.js
- API RESTful con datos en memoria

---

## 📂 Archivos Clave

- `app.js`: lógica de frontend
- `styles.css`: animaciones, diseño y responsividad
- `index.js`: servidor Express principal

---

## 🤖 Asistencia con Inteligencia Artificial

### Modelos Utilizados

- **ChatGPT (GPT-4o / GPT-4 Turbo)**  
  Se usó para:
  - Generación de código HTML, CSS y JS.
  - Diseño de funciones del frontend y backend.
  - Solución de errores comunes.
  - Generación de animaciones CSS y estructura Markdown.

- **DeepSeek Code**  
  Se usó para:
  - Sugerencias sintéticas de lógica repetitiva.
  - Código limpio con promesas bien estructuradas.
  - Simplificación de rutas y controladores.

---

## 💬 Prompts Más Efectivos

```plaintext
"Quiero una tabla en estudiantes.html con DataTables, con botones de eliminar y sin editar, y que use fetch al backend."

"Corrige este error 404 al cargar estudiantes desde el frontend."

"Agrega explicaciones al final de cada función JS sin cambiar el código."

"Genera un efecto de animación al cargar cada HTML con solo CSS."

"Explícame qué hace este código del backend y si está bien."
```

---

## ✅ Resultados Obtenidos

- Flujo de trabajo más eficiente gracias a IA.
- Código modular, organizado y reutilizable.
- Claridad en funciones, rutas y documentación.
- Interfaz amigable con experiencia de usuario fluida.

---

## 📌 Recomendación Final

Usar herramientas como **ChatGPT** y **DeepSeek Code** acelera el desarrollo, mejora la calidad del código y facilita la comprensión técnica del proyecto.

---

**Hecho con pasión, café y tecnología. ☕💻🚀**

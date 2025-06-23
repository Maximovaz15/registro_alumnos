// =============================
// CONSTANTES Y CONFIGURACIÓN
// =============================
const API_URL_STUDENTS = "http://localhost:5001/api/students";
const API_URL_CAREERS = "http://localhost:5001/api/careers";
const API_URL_CATEGORIES = "http://localhost:5001/api/categories";
const API_KEY = "12345ABCDEF";

// Configuración de headers para las peticiones HTTP
const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_KEY}`
};

// =============================
// FUNCIONES AUXILIARES
// =============================

// Carga dinámica de dependencias (jQuery y DataTables)
// Verifica si ya están cargadas y si no, las carga mediante elementos script
const loadDependencies = () => {
  return new Promise((resolve) => {
    if (window.$ && window.$.fn.DataTable) {
      resolve();
      return;
    }

    const scriptJQuery = document.createElement('script');
    scriptJQuery.src = 'https://code.jquery.com/jquery-3.7.0.min.js';
    scriptJQuery.onload = () => {
      const scriptDataTables = document.createElement('script');
      scriptDataTables.src = 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js';
      scriptDataTables.onload = resolve;
      document.head.appendChild(scriptDataTables);
    };
    document.head.appendChild(scriptJQuery);
  });
};

// Función para cargar SweetAlert2 dinámicamente
// Retorna una promesa que resuelve cuando SweetAlert2 está listo para usar
const SweetAlert = () => {
  return new Promise((resolve) => {
    if (window.Swal) {
      resolve(window.Swal);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    script.onload = () => resolve(window.Swal);
    document.head.appendChild(script);
  });
};

// =============================
// FUNCIONES PARA CARGAR SELECTS
// =============================

// Carga las carreras disponibles en el select de estudiantes
// Hace una petición GET a la API de carreras y llena el select
function loadCareersForStudentSelect() {
  fetch(API_URL_CAREERS, {
    method: "GET",
    headers
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(careers => {
      const select = document.getElementById("studentCategory");
      if (!select) return;

      select.innerHTML = '<option value="" disabled selected>Seleccione una carrera</option>';

      careers.forEach(career => {
        const option = document.createElement("option");
        option.value = career.name;
        option.textContent = career.name;
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Error cargando carreras:", err);
      Swal.fire("Error", "No se pudieron cargar las carreras.", "error");
    });
}

// Carga las categorías disponibles en el select de carreras
// Hace una petición GET a la API de categorías y llena el select
function loadCategoriesForSelect() {
  fetch(API_URL_CATEGORIES, {
    method: "GET",
    headers
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(categories => {
      const select = document.getElementById("careerCategory");
      if (!select) return;

      select.innerHTML = '<option value="" disabled selected>Seleccione una categoría</option>';

      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.name;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Error cargando categorías:", err);
      Swal.fire("Error", "No se pudieron cargar las categorías.", "error");
    });
}

// =============================
// FUNCIONES ESTUDIANTES
// =============================

// Servicio para registrar un nuevo estudiante
// Recibe nombre y carrera, hace POST a la API y retorna la respuesta
async function registerStudentService(name, career) {
  const response = await fetch(API_URL_STUDENTS, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, career })
  });
  return response.json();
}

// Servicio para obtener un estudiante por ID
// Recibe el ID, hace GET a la API y retorna los datos del estudiante
async function getStudentByIdService(id) {
  const response = await fetch(`${API_URL_STUDENTS}/${id}`, {
    method: "GET",
    headers
  });
  return response.json();
}

// Servicio para obtener estudiantes por carrera
// Recibe el nombre de la carrera, hace GET con filtro y retorna la lista
async function getStudentsByCareerService(career) {
  const response = await fetch(`${API_URL_STUDENTS}?career=${encodeURIComponent(career)}`, {
    method: "GET",
    headers
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

// Servicio para eliminar un estudiante por ID
// Recibe el ID, hace DELETE a la API y retorna la respuesta
async function deleteStudentService(id) {
  const response = await fetch(`${API_URL_STUDENTS}/${id}`, {
    method: "DELETE",
    headers
  });
  return response.json();
}

// Función principal para registrar un estudiante
// Obtiene los datos del formulario, valida y llama al servicio de registro
// Muestra el resultado en la interfaz y notificaciones con SweetAlert
async function registerStudent() {
  const nameInput = document.getElementById('registerName');
  const careerSelect = document.getElementById('studentCategory');
  const resultContainer = document.getElementById('registerResult');

  if (!nameInput || !careerSelect) {
    Swal.fire("Error interno", "No se encontraron los campos del formulario.", "error");
    return;
  }

  const name = nameInput.value.trim();
  const career = careerSelect.value.trim();

  if (!name || !career) {
    Swal.fire("Campos incompletos", "Por favor complete todos los campos.", "warning");
    return;
  }

  try {
    const result = await registerStudentService(name, career);

    if (result.error) {
      resultContainer.innerHTML = `
        <div class="student-result error">
          <div class="result-header">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error al registrar estudiante</h3>
          </div>
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">Mensaje:</span>
              <span class="detail-value">${result.error}</span>
            </div>
          </div>
        </div>`;
      Swal.fire("Error", result.error, "error");
      return;
    }

    resultContainer.innerHTML = `
      <div class="student-result success">
        <div class="result-header">
          <i class="fas fa-check-circle"></i>
          <h3>Estudiante registrado exitosamente</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${result.student.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${result.student.name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Carrera:</span>
            <span class="detail-value">${result.student.career}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value">${new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>`;

    Swal.fire({
      title: "Estudiante registrado",
      html: `
        <div class="swal-student-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${result.student.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${result.student.name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Carrera:</span>
            <span class="detail-value">${result.student.career}</span>
          </div>
        </div>
      `,
      icon: "success"
    });

    nameInput.value = '';
    careerSelect.selectedIndex = 0;

  } catch (error) {
    console.error("Error registering student:", error);
    resultContainer.innerHTML = `
      <div class="student-result error">
        <div class="result-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error en el sistema</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Detalle:</span>
            <span class="detail-value">No se pudo registrar el estudiante</span>
          </div>
        </div>
      </div>`;
    Swal.fire("Error", "No se pudo registrar el estudiante.", "error");
  }
}

// Función principal para obtener un estudiante por ID
// Obtiene el ID del formulario, valida y llama al servicio correspondiente
// Muestra los datos del estudiante o errores en la interfaz
async function getStudentById() {
  const id = document.getElementById('studentId').value.trim();
  const resultContainer = document.getElementById('getResult');
  
  if (!id) {
    Swal.fire("Falta el ID", "Por favor ingrese un ID válido.", "warning");
    return;
  }

  try {
    const student = await getStudentByIdService(id);
    
    if (student.error) {
      resultContainer.innerHTML = `
        <div class="student-result error">
          <div class="result-header">
            <i class="fas fa-user-slash"></i>
            <h3>Estudiante no encontrado</h3>
          </div>
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">ID buscado:</span>
              <span class="detail-value">${id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Error:</span>
              <span class="detail-value">${student.error}</span>
            </div>
          </div>
        </div>`;
      Swal.fire("Error", student.error, "error");
      return;
    }

    resultContainer.innerHTML = `
      <div class="student-result success">
        <div class="result-header">
          <i class="fas fa-user-graduate"></i>
          <h3>Datos del Estudiante</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${student.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${student.name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Carrera:</span>
            <span class="detail-value">${student.career}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value">Activo</span>
          </div>
        </div>
      </div>`;
    
    Swal.fire({
      title: "Estudiante encontrado",
      html: `
        <div class="swal-student-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${student.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${student.name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Carrera:</span>
            <span class="detail-value">${student.career}</span>
          </div>
        </div>
      `,
      icon: "success"
    });

  } catch (error) {
    console.error("Error fetching student:", error);
    resultContainer.innerHTML = `
      <div class="student-result error">
        <div class="result-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error en el sistema</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Detalle:</span>
            <span class="detail-value">No se pudo obtener el estudiante</span>
          </div>
        </div>
      </div>`;
    Swal.fire("Error", "No se pudo obtener el estudiante.", "error");
  }
}

// Función principal para obtener estudiantes por carrera
// Obtiene la carrera del formulario, valida y llama al servicio correspondiente
// Muestra una lista de estudiantes o mensaje si no hay resultados
async function getStudentsByCareer() {
  const career = document.getElementById('careerFilter').value.trim();
  const resultContainer = document.getElementById('careerResult');

  if (!career) {
    Swal.fire("Campo requerido", "Por favor ingrese una carrera.", "info");
    return;
  }

  try {
    const students = await getStudentsByCareerService(career);

    if (!Array.isArray(students) || students.length === 0) {
      resultContainer.innerHTML = `
        <div class="student-result info">
          <div class="result-header">
            <i class="fas fa-info-circle"></i>
            <h3>No se encontraron estudiantes</h3>
          </div>
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-value">No hay estudiantes registrados en la carrera "${career}"</span>
            </div>
          </div>
        </div>`;
      return;
    }

    const studentsHTML = students.map(student => `
      <div class="student-card">
        <div class="student-details compact">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${student.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${student.name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Carrera:</span>
            <span class="detail-value">${student.career}</span>
          </div>
        </div>
      </div>
    `).join('');

    resultContainer.innerHTML = `
      <div class="student-list-container">
        <div class="list-header">
          <i class="fas fa-users"></i>
          <h3>Estudiantes de ${career} (${students.length})</h3>
        </div>
        <div class="student-list">
          ${studentsHTML}
        </div>
      </div>`;

  } catch (error) {
    console.error("Error fetching students:", error);
    resultContainer.innerHTML = `
      <div class="student-result error">
        <div class="result-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error en la búsqueda</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-value">No se pudo obtener la lista de estudiantes. Intente nuevamente.</span>
          </div>
        </div>
      </div>`;
    Swal.fire("Error", "No se pudo obtener la lista de estudiantes.", "error");
  }
}

// Función principal para eliminar un estudiante
// Obtiene el ID del formulario, valida y llama al servicio de eliminación
// Muestra confirmación y resultado de la operación
async function deleteStudent() {
  const id = document.getElementById('deleteId').value.trim();
  const resultContainer = document.getElementById('deleteResult');
  
  if (!id) {
    Swal.fire("Falta ID", "Por favor ingrese el ID del estudiante.", "warning");
    return;
  }

  try {
    const result = await deleteStudentService(id);
    
    if (result.error) {
      resultContainer.innerHTML = `
        <div class="student-result error">
          <div class="result-header">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error al eliminar</h3>
          </div>
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">ID:</span>
              <span class="detail-value">${id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Error:</span>
              <span class="detail-value">${result.error}</span>
            </div>
          </div>
        </div>`;
      Swal.fire("Error", result.error, "error");
      return;
    }

    resultContainer.innerHTML = `
      <div class="student-result success">
        <div class="result-header">
          <i class="fas fa-trash-alt"></i>
          <h3>Estudiante eliminado</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value">Eliminado correctamente</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Hora:</span>
            <span class="detail-value">${new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>`;
    
    Swal.fire({
      title: "Estudiante eliminado",
      html: `
        <div class="swal-student-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value">Eliminado correctamente</span>
          </div>
        </div>
      `,
      icon: "success"
    });

  } catch (error) {
    console.error("Error deleting student:", error);
    resultContainer.innerHTML = `
      <div class="student-result error">
        <div class="result-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error en el sistema</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Detalle:</span>
            <span class="detail-value">No se pudo eliminar el estudiante</span>
          </div>
        </div>
      </div>`;
    Swal.fire("Error", "No se pudo eliminar el estudiante.", "error");
  }
}

// =============================
// FUNCIONES CARRERAS
// =============================

// Función principal para registrar una carrera
// Obtiene datos del formulario, valida y llama al servicio correspondiente
// Muestra resultado de la operación con detalles de la carrera registrada
async function registerCareer() {
  const name = document.getElementById("careerName").value.trim();
  const category = document.getElementById("careerCategory").value;
  const duration = document.getElementById("careerDuration").value;
  const type = document.getElementById("careerType").value;
  const output = document.getElementById("registerCareerResult");

  if (!name || !category || !duration || !type) {
    Swal.fire("Campos incompletos", "Por favor complete todos los campos.", "warning");
    return;
  }

  try {
    const response = await fetch(API_URL_CAREERS, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, category, duration, type })
    });

    if (response.status === 409) {
      output.innerHTML = `
        <div class="career-result error">
          <div class="result-header">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Carrera duplicada</h3>
          </div>
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">Error:</span>
              <span class="detail-value">La carrera "${name}" ya está registrada</span>
            </div>
          </div>
        </div>`;
      Swal.fire("Carrera duplicada", `La carrera "${name}" ya está registrada.`, "error");
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Solución 1: Verificar si el ID viene en la respuesta
    let careerId = data.id || data.career?.id;
    
    // Solución 2: Si no viene el ID, obtenerlo de la lista completa
    if (!careerId) {
      const allCareersResponse = await fetch(API_URL_CAREERS, { headers });
      const allCareers = await allCareersResponse.json();
      const lastCareer = allCareers[allCareers.length - 1];
      careerId = lastCareer.id;
    }
    
    // Solución 3: Si todo falla, mostrar mensaje alternativo
    if (!careerId) {
      careerId = "ID no disponible (actualice la lista)";
    }

    output.innerHTML = `
      <div class="career-result success">
        <div class="result-header">
          <i class="fas fa-check-circle"></i>
          <h3>Carrera registrada exitosamente</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${careerId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Categoría:</span>
            <span class="detail-value">${category}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duración:</span>
            <span class="detail-value">${duration} años</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">${type}</span>
          </div>
        </div>
      </div>`;
    
    Swal.fire({
      title: "Carrera registrada",
      html: `
        <div class="swal-career-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${careerId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${name}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Categoría:</span>
            <span class="detail-value">${category}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duración:</span>
            <span class="detail-value">${duration} años</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">${type}</span>
          </div>
        </div>
      `,
      icon: "success"
    });
    
  } catch (err) {
    console.error("Error registrando carrera:", err);
    output.innerHTML = `
      <div class="career-result error">
        <div class="result-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error al registrar</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Detalle:</span>
            <span class="detail-value">No se pudo registrar la carrera</span>
          </div>
        </div>
      </div>`;
    Swal.fire("Error", "No se pudo registrar la carrera.", "error");
  }
}

// Función principal para obtener una carrera por ID
// Obtiene el ID del formulario, valida y llama al servicio correspondiente
// Muestra los datos de la carrera o mensaje de error si no se encuentra
async function getCareerById() {
  const id = document.getElementById("careerId").value.trim();
  const output = document.getElementById("getCareerResult");

  if (!id) {
    Swal.fire("Falta ID", "Ingrese un ID de carrera.", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_URL_CAREERS}/${id}`, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      output.innerHTML = `
        <div class="career-result error">
          <div class="result-header">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error al buscar carrera</h3>
          </div>
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">Error:</span>
              <span class="detail-value">${data.error}</span>
            </div>
          </div>
        </div>`;
      Swal.fire("Error", data.error, "error");
      return;
    }

    output.innerHTML = `
      <div class="career-result success">
        <div class="result-header">
          <i class="fas fa-book-open"></i>
          <h3>Datos de la Carrera</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${data.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${data.name}</span>
          </div>
          ${data.category ? `
          <div class="detail-row">
            <span class="detail-label">Categoría:</span>
            <span class="detail-value">${data.category}</span>
          </div>` : ''}
          ${data.duration ? `
          <div class="detail-row">
            <span class="detail-label">Duración:</span>
            <span class="detail-value">${data.duration} años</span>
          </div>` : ''}
          ${data.type ? `
          <div class="detail-row">
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">${data.type}</span>
          </div>` : ''}
        </div>
      </div>`;

    Swal.fire({
      title: "Carrera encontrada",
      html: `
        <div class="swal-career-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${data.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${data.name}</span>
          </div>
          ${data.category ? `
          <div class="detail-row">
            <span class="detail-label">Categoría:</span>
            <span class="detail-value">${data.category}</span>
          </div>` : ''}
          ${data.duration ? `
          <div class="detail-row">
            <span class="detail-label">Duración:</span>
            <span class="detail-value">${data.duration} años</span>
          </div>` : ''}
          ${data.type ? `
          <div class="detail-row">
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">${data.type}</span>
          </div>` : ''}
        </div>
      `,
      icon: "success"
    });

  } catch (error) {
    console.error("Error obteniendo carrera:", error);
    output.innerHTML = `
      <div class="career-result error">
        <div class="result-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error en el sistema</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Detalle:</span>
            <span class="detail-value">No se pudo obtener la carrera</span>
          </div>
        </div>
      </div>`;
    Swal.fire("Error", "No se pudo obtener la carrera.", "error");
  }
}

// Función para obtener y mostrar todas las carreras en una tabla DataTable
// Muestra una tabla con todas las carreras registradas y opción para eliminarlas
function getAllCareers() {
  fetch(API_URL_CAREERS, { headers })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(careers => {
      const container = document.getElementById("careersTableContainer");

      if (!Array.isArray(careers) || careers.length === 0) {
        container.innerHTML = `
          <div class="career-result info">
            <div class="result-header">
              <i class="fas fa-info-circle"></i>
              <h3>No hay carreras registradas</h3>
            </div>
            <div class="result-details">
              <div class="detail-row">
                <span class="detail-value">No se encontraron carreras en el sistema</span>
              </div>
            </div>
          </div>`;
        return;
      }

      const rows = careers.map(career => `
        <tr>
          <td>${career.id}</td>
          <td>${career.name}</td>
          <td>${career.category || 'N/A'}</td>
          <td>${career.duration ? career.duration + ' años' : 'N/A'}</td>
          <td>
            <button class="action-btn delete" onclick="deleteCareerById('${career.id}')">
              <i class="fas fa-trash-alt"></i> Eliminar
            </button>
          </td>
        </tr>
      `).join('');

      container.innerHTML = `
        <table id="careersTable" class="display" style="width:100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Duración</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
 setTimeout(() => {
        if ($.fn.DataTable.isDataTable('#careersTable')) {
          $('#careersTable').DataTable().destroy();
        }
        $('#careersTable').DataTable({
          language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
          },
          lengthMenu: [5, 10, 15, 20, 25], // Mostrar opciones de 5 en 5
          pageLength: 5 // Mostrar 5 registros por defecto
        });
      }, 0);
    })
    .catch(error => {
      console.error("Error al cargar carreras:", error);
      const container = document.getElementById("careersTableContainer");
      container.innerHTML = `
        <div class="career-result error">
          <div class="result-header">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error al cargar carreras</h3>
          </div>
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">Detalle:</span>
              <span class="detail-value">No se pudo cargar la lista de carreras</span>
            </div>
          </div>
        </div>`;
    });
}

// Función para eliminar una carrera por ID con confirmación
// Muestra un diálogo de confirmación antes de eliminar
// Actualiza la tabla de carreras después de la eliminación
function deleteCareerById(id) {
  Swal.fire({
    title: "¿Eliminar carrera?",
    text: `¿Estás seguro de eliminar la carrera con ID ${id}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#7f8c8d",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`${API_URL_CAREERS}/${id}`, {
        method: "DELETE",
        headers
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(() => {
          Swal.fire({
            title: "Eliminada",
            html: `
              <div class="swal-career-details">
                <div class="detail-row">
                  <span class="detail-label">ID:</span>
                  <span class="detail-value">${id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Estado:</span>
                  <span class="detail-value">Carrera eliminada correctamente</span>
                </div>
              </div>
            `,
            icon: "success"
          });
          getAllCareers();
        })
        .catch(err => {
          console.error("Error al eliminar carrera:", err);
          Swal.fire("Error", "No se pudo eliminar la carrera.", "error");
        });
    }
  });
}

// =============================
// FUNCIONES CATEGORÍAS
// =============================

// Función principal para registrar una categoría
// Obtiene el nombre del formulario, valida y llama al servicio correspondiente
// Muestra el resultado de la operación
// Función para registrar una nueva categoría
// Valida los campos y muestra el resultado de la operación
async function registerCategories() {
  const name = document.getElementById("registerName").value.trim();
  const output = document.getElementById("registerResult");

  if (!name) {
    Swal.fire("Campos incompletos", "Por favor complete el nombre.", "warning");
    return;
  }

  try {
    // 1. Registrar la nueva categoría
    const response = await fetch(API_URL_CATEGORIES, {
      method: "POST",
      headers,
      body: JSON.stringify({ name })
    });

    if (response.status === 409) {
      output.innerHTML = `
        <div class="career-result error">
          <div class="result-header">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Categoría duplicada</h3>
          </div>
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">Error:</span>
              <span class="detail-value">La categoría "${name}" ya está registrada</span>
            </div>
          </div>
        </div>`;
      Swal.fire("Categoría duplicada", `La categoría "${name}" ya está registrada.`, "error");
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // 2. Obtener el ID de la categoría registrada
    let categoryId = data.id || data.category?.id;
    
    // 3. Si no viene en la respuesta, obtenerlo de la lista completa
    if (!categoryId) {
      const allCategories = await fetch(API_URL_CATEGORIES, { headers });
      const categoriesData = await allCategories.json();
      const lastCategory = categoriesData[categoriesData.length - 1];
      categoryId = lastCategory.id;
    }

    // 4. Si todo falla, mostrar mensaje alternativo
    if (!categoryId) {
      categoryId = "ID no disponible (actualice la lista)";
    }

    // 5. Mostrar resultados
    output.innerHTML = `
      <div class="career-result success">
        <div class="result-header">
          <i class="fas fa-check-circle"></i>
          <h3>Categoría registrada exitosamente</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${categoryId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${name}</span>
          </div>
        </div>
      </div>`;
    
    Swal.fire({
      title: "Categoría registrada",
      html: `
        <div class="swal-career-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${categoryId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${name}</span>
          </div>
        </div>
      `,
      icon: "success"
    });

    // Limpiar el campo de entrada después del registro exitoso
    document.getElementById("registerName").value = '';

  } catch (error) {
    console.error("Error registrando categoría:", error);
    output.innerHTML = `
      <div class="career-result error">
        <div class="result-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error al registrar</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Detalle:</span>
            <span class="detail-value">No se pudo registrar la categoría</span>
          </div>
        </div>
      </div>`;
    Swal.fire("Error", "No se pudo registrar la categoría.", "error");
  }
}

// Función principal para obtener una categoría por ID
// Obtiene el ID del formulario, valida y llama al servicio correspondiente
// Muestra los datos de la categoría o mensaje de error si no se encuentra
async function getCategoriesById() {
  const id = document.getElementById("categoryId").value.trim();
  const output = document.getElementById("getResult");

  if (!id) {
    Swal.fire("Falta ID", "Ingrese un ID de categoría.", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_URL_CATEGORIES}/${id}`, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      output.innerHTML = `
        <div class="career-result error">
          <div class="result-header">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error al buscar categoría</h3>
          </div>
          <div class="result-details">
            <div class="detail-row">
              <span class="detail-label">Error:</span>
              <span class="detail-value">${data.error}</span>
            </div>
          </div>
        </div>`;
      Swal.fire("Error", data.error, "error");
      return;
    }

    output.innerHTML = `
      <div class="career-result success">
        <div class="result-header">
          <i class="fas fa-tag"></i>
          <h3>Datos de la Categoría</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${data.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${data.name}</span>
          </div>
          ${data.description ? `
          <div class="detail-row">
            <span class="detail-label">Descripción:</span>
            <span class="detail-value">${data.description}</span>
          </div>` : ''}
        </div>
      </div>`;

    Swal.fire({
      title: "Categoría encontrada",
      html: `
        <div class="swal-career-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${data.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${data.name}</span>
          </div>
          ${data.description ? `
          <div class="detail-row">
            <span class="detail-label">Descripción:</span>
            <span class="detail-value">${data.description}</span>
          </div>` : ''}
        </div>
      `,
      icon: "success"
    });

  } catch (error) {
    console.error("Error obteniendo categoría:", error);
    output.innerHTML = `
      <div class="career-result error">
        <div class="result-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error en el sistema</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">Detalle:</span>
            <span class="detail-value">No se pudo obtener la categoría</span>
          </div>
        </div>
      </div>`;
    Swal.fire("Error", "No se pudo obtener la categoría.", "error");
  }
}

// Función principal para eliminar una categoría
// Obtiene el ID del formulario, valida y llama al servicio correspondiente
// Muestra confirmación y resultado de la operación
async function deleteCategories() {
  const id = document.getElementById("deleteId").value.trim();
  const output = document.getElementById("deleteResult");

  if (!id) {
    Swal.fire("Falta ID", "Ingrese el ID de la categoría a eliminar.", "warning");
    return;
  }

  try {
    // Primero obtenemos los datos de la categoría para mostrarlos en el resultado
    const getResponse = await fetch(`${API_URL_CATEGORIES}/${id}`, {
      method: "GET",
      headers
    });

    if (!getResponse.ok) {
      throw new Error("Categoría no encontrada");
    }

    const categoryData = await getResponse.json();

    // Luego eliminamos la categoría
    const deleteResponse = await fetch(`${API_URL_CATEGORIES}/${id}`, {
      method: "DELETE",
      headers
    });

    if (!deleteResponse.ok) {
      throw new Error(`HTTP ${deleteResponse.status}`);
    }

    output.innerHTML = `
      <div class="career-result success">
        <div class="result-header">
          <i class="fas fa-trash-alt"></i>
          <h3>Categoría eliminada</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${categoryData.name || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value">Eliminada correctamente</span>
          </div>
        </div>
      </div>`;

    Swal.fire({
      title: "Categoría eliminada",
      html: `
        <div class="swal-career-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">${categoryData.name || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value">Eliminada correctamente</span>
          </div>
        </div>
      `,
      icon: "success"
    });

  } catch (error) {
    console.error("Error eliminando categoría:", error);
    output.innerHTML = `
      <div class="career-result error">
        <div class="result-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error al eliminar</h3>
        </div>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Error:</span>
            <span class="detail-value">${error.message === "Categoría no encontrada" ? 
              'La categoría no existe' : 
              'No se pudo completar la eliminación'}</span>
          </div>
        </div>
      </div>`;

    Swal.fire({
      title: "Error",
      html: `
        <div class="swal-career-details">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Error:</span>
            <span class="detail-value">${error.message === "Categoría no encontrada" ? 
              'La categoría no existe' : 
              'No se pudo completar la eliminación'}</span>
          </div>
        </div>
      `,
      icon: "error"
    });
  }
}
  if (document.getElementById('studentCategory')) {
    loadCareersForStudentSelect();
  }
  
  // Cargar categorías en el select de carreras (si existe)
  if (document.getElementById('careerCategory')) {
    loadCategoriesForSelect();
  }

  // Inicializar DataTables si existe la tabla
  setTimeout(() => {
    const tabla = document.querySelector('#miTabla');
    if (tabla) {
      new DataTable(tabla);
    }
  }, 200);

// app.js

// 1. Función para cargar SweetAlert2 dinámicamente
const loadSweetAlert = () => {
  return new Promise((resolve) => {
    if (window.Swal) {
      resolve(window.Swal);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    script.onload = () => resolve(window.Swal);
    document.head.appendChild(script);
  });
};

// 2. Modificar tus funciones para usar el Swal cargado dinámicamente
async function showAlert() {
  const Swal = await loadSweetAlert();
  Swal.fire('¡Éxito!', 'Operación completada', 'success');
}

// 3. Inicialización de eventos (reemplaza los onclick)
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar SweetAlert2 primero
  await loadSweetAlert();
  
  // Asignar eventos
  document.getElementById('btnRegister')?.addEventListener('click', registerCategories);
  document.getElementById('btnSearch')?.addEventListener('click', getCategoriesById);
  document.getElementById('btnDelete')?.addEventListener('click', deleteCategories);
});
document.addEventListener('DOMContentLoaded', function() {
  // Asignar event listeners
  document.getElementById('btnRegister')?.addEventListener('click', registerStudent);
  // ... otros listeners
});
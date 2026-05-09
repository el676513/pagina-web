document.addEventListener('DOMContentLoaded', () => {
    // ==================== SISTEMA DE PESTAÑAS (SOLO PARA index.html CON PESTAÑAS) ====================
    const botonesPestana = document.querySelectorAll('.pestana-link');
    const tabs = document.querySelectorAll('.tab-content');
    
    // Solo ejecutar si existen los elementos de pestañas (para no interferir en páginas independientes)
    if (botonesPestana.length > 0 && tabs.length > 0) {
        function activarPestana(id) {
            tabs.forEach(tab => tab.classList.remove('activa'));
            const tabActivo = document.getElementById(id);
            if (tabActivo) tabActivo.classList.add('activa');
            botonesPestana.forEach(btn => btn.classList.remove('activa'));
            const btnActivo = document.querySelector(`.pestana-link[data-tab="${id}"]`);
            if (btnActivo) btnActivo.classList.add('activa');
        }

        botonesPestana.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                activarPestana(tabId);
            });
        });

        if (!document.querySelector('.tab-content.activa')) activarPestana('inicio');
    }

    // ==================== MODO OSCURO ====================
    const btnModo = document.getElementById('btnModoOscuro');
    if (btnModo) {
        if (localStorage.getItem('modo') === 'oscuro') document.body.classList.add('modo-oscuro');
        btnModo.addEventListener('click', () => {
            document.body.classList.toggle('modo-oscuro');
            localStorage.setItem('modo', document.body.classList.contains('modo-oscuro') ? 'oscuro' : 'claro');
        });
    }

    // Botón volver arriba
    const btnArriba = document.getElementById('btnVolverArriba');
    if (btnArriba) {
        window.addEventListener('scroll', () => {
            btnArriba.style.display = window.scrollY > 300 ? 'flex' : 'none';
        });
        btnArriba.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Comentarios (solo en index.html)
    const btnAgregar = document.getElementById('agregarComentario');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            const input = document.getElementById('nuevoComentario');
            if (input.value.trim() === '') return alert('Escribe un comentario');
            const li = document.createElement('li');
            li.innerHTML = `${input.value} <button onclick="this.parentElement.remove()" style="color:red; background:none; border:none; cursor:pointer;">❌</button>`;
            document.getElementById('listaComentarios').appendChild(li);
            input.value = '';
        });
    }

    // =============== CUESTIONARIO (VALIDACIÓN DE 5 PREGUNTAS) ===============
    const formCuestionario = document.getElementById('formCuestionario');
    if (formCuestionario) {
        formCuestionario.addEventListener('submit', (e) => {
            e.preventDefault();
            let score = 0;
            let totalPreguntas = 0;
            
            // Buscar todas las preguntas (q1, q2, q3, q4, q5)
            for (let i = 1; i <= 5; i++) {
                const pregunta = document.querySelector(`input[name="q${i}"]:checked`);
                if (pregunta) {
                    totalPreguntas++;
                    // Respuestas correctas según la cultura del casino
                    if ((i === 1 && pregunta.value === 'lasvegas') ||
                        (i === 2 && pregunta.value === 'retorno') ||
                        (i === 3 && pregunta.value === 'charles') ||
                        (i === 4 && pregunta.value === 'winstar') ||
                        (i === 5 && pregunta.value === 'poker')) {
                        score++;
                    }
                }
            }
            
            // Mostrar resultado (si no hay preguntas, total será 0)
            if (totalPreguntas === 0) {
                alert('Por favor, responde al menos una pregunta.');
                return;
            }
            
            let mensaje = ` Puntuación: ${score}/${totalPreguntas}. `;
            if (score === totalPreguntas && totalPreguntas === 5) mensaje += '¡Eres experto!';
            else if (score >= 3) mensaje += '¡Bien! ';
            else mensaje += 'Vuelve a intentarlo.';
            
            alert(mensaje);
        });
    }

    // Likes (solo en index.html)
    const btnLike = document.getElementById('btnMeGusta');
    const contadorLike = document.getElementById('contadorLike');
    if (btnLike && contadorLike) {
        let likes = localStorage.getItem('casino_likes') || 0;
        likes = parseInt(likes);
        contadorLike.textContent = likes;
        btnLike.addEventListener('click', () => {
            likes++;
            contadorLike.textContent = likes;
            localStorage.setItem('casino_likes', likes);
            btnLike.style.transform = 'scale(1.1)';
            setTimeout(() => btnLike.style.transform = 'scale(1)', 150);
        });
    }

    // Registro VIP (solo en formulario.html)
    const formReg = document.getElementById('formRegistro');
    if (formReg) {
        formReg.addEventListener('submit', (e) => {
            e.preventDefault();
            alert(' Registro exitoso. Revisa tu correo con el bono de $500.');
            formReg.reset();
        });
    }

    // =============== CRUD DE PRODUCTOS (MongoDB) ===============
    const API_URL = 'http://localhost:3000/api/productos';
    const listaProductos = document.getElementById('listaProductos');
    
    async function cargarProductos() {
        if (!listaProductos) return;
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            listaProductos.innerHTML = '';
            if (data.productos && data.productos.length) {
                data.productos.forEach(p => {
                    listaProductos.innerHTML += `<li style="background:rgba(204,0,0,0.1); margin:10px; padding:12px; border-radius:15px;">
                        <strong>${p.nombre}</strong> - $${p.precio} - ${p.categoria} 
                        <span style="float:right;">ID: ${p._id}</span>
                    </li>`;
                });
            } else {
                listaProductos.innerHTML = '<li>No hay productos cargados.</li>';
            }
        } catch (e) {
            console.error('Error al cargar productos.');
            listaProductos.innerHTML = '<li>Servidor no disponible. Inicia el backend con "node server.js"</li>';
        }
    }

    const btnAgregarProd = document.getElementById('btnAgregarProducto');
    if (btnAgregarProd) {
        btnAgregarProd.addEventListener('click', async () => {
            const nombre = document.getElementById('prodNombre').value;
            const precio = parseFloat(document.getElementById('prodPrecio').value);
            const categoria = document.getElementById('prodCategoria').value;
            if (!nombre || isNaN(precio) || !categoria) return alert('Completa todos los campos');
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, precio, categoria })
            });
            cargarProductos();
            document.getElementById('prodNombre').value = '';
            document.getElementById('prodPrecio').value = '';
            document.getElementById('prodCategoria').value = '';
        });
    }

    const btnActualizar = document.getElementById('btnActualizarProducto');
    if (btnActualizar) {
        btnActualizar.addEventListener('click', async () => {
            const id = document.getElementById('updateId').value;
            const nombre = document.getElementById('updateNombre').value;
            const precio = document.getElementById('updatePrecio').value ? parseFloat(document.getElementById('updatePrecio').value) : undefined;
            if (!id) return alert('ID requerido');
            const body = {};
            if (nombre) body.nombre = nombre;
            if (precio !== undefined) body.precio = precio;
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            cargarProductos();
            document.getElementById('updateId').value = '';
            document.getElementById('updateNombre').value = '';
            document.getElementById('updatePrecio').value = '';
        });
    }

    const btnEliminar = document.getElementById('btnEliminarProducto');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', async () => {
            const id = document.getElementById('deleteId').value;
            if (!id) return alert('ID requerido');
            if (confirm('¿Eliminar permanentemente este producto?')) {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                cargarProductos();
                document.getElementById('deleteId').value = '';
            }
        });
    }

    const btnRefrescar = document.getElementById('btnRefrescar');
    if (btnRefrescar) btnRefrescar.addEventListener('click', cargarProductos);

    if (listaProductos) cargarProductos();
});
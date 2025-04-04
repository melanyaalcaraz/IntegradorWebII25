
// Función conectar
async function conectar(endpoint, opciones = {}) {
    const urlBase = 'https://restcountries.com/v3.1'; // URL base de la API
    const urlCompleta = `${urlBase}${endpoint}`;

    try {
        const respuesta = await fetch(urlCompleta, opciones);
        if (!respuesta.ok) {
            throw new Error(`Error: ${respuesta.status} - ${respuesta.statusText}`);
        }
        return await respuesta.json();
    } catch (error) {
        console.error('La conexión no funca:', error);
        throw error;
    }
}

function generarRadios(countries) {
    const container = document.getElementById('opciones');
    container.innerHTML = ''; // Limpiar cualquier contenido previo

    countries.forEach((country, index) => {
        // Crear un ID único para cada radio
        const radioId = `radio-${index}`;

        // Crear elemento radio
        const radioOption = document.createElement('input');
        radioOption.type = 'radio';
        radioOption.name = 'pais';
        radioOption.id = radioId; // Asignar el ID único
        radioOption.value = country.name.common;

        // Crear etiqueta para el radio
        const label = document.createElement('label');
        label.htmlFor = radioId; // Vincular la etiqueta con el radio mediante el ID
        label.textContent = country.name.common;

        // Añadir el radio y la etiqueta al contenedor
        const div = document.createElement('div'); // Agrupador
        div.appendChild(radioOption);
        div.appendChild(label);
        container.appendChild(div);
    });
}
function generarRadiosNumero(opciones) {
    const container = document.getElementById('opciones');
    container.innerHTML = ''; // Limpiar cualquier contenido previo

    opciones.forEach((opcion, index) => {
        // Crear un ID único para cada radio
        const radioId = `radio-${index}`;

        // Crear elemento radio
        const radioOption = document.createElement('input');
        radioOption.type = 'radio';
        radioOption.name = 'pais'; // El "name" debe ser igual para agrupar los radios
        radioOption.id = radioId;
        radioOption.value = opcion; // La opción puede ser un número o texto

        // Crear etiqueta para el radio
        const label = document.createElement('label');
        label.htmlFor = radioId; // Vincular la etiqueta con el radio mediante el ID
        label.textContent = opcion; // Mostrar texto legible para números y letras

        // Añadir el radio y la etiqueta al contenedor
        const div = document.createElement('div');
        div.appendChild(radioOption);
        div.appendChild(label);
        container.appendChild(div);
    });
}

async function obtenerCapital() {

    const todosLosPaises = await conectar('/all');
    const paisConCapital = todosLosPaises
        .filter(country => country.capital && country.capital.length > 0)
        .sort(() => 0.5 - Math.random())
        .slice(0, 1);
    console.log("Hola " + paisConCapital[0].capital)
    return paisConCapital[0].capital;

}


async function obtenerPaisDeCapital() {
    const capital = await obtenerCapital();
    console.log(capital);
    const endpoint = `/capital/${encodeURIComponent(capital)}`; // Sustituimos {capital} con la capital real
    const datos = await conectar(endpoint);
    console.log(datos[0])
    return datos[0]; // Retornamos el primer objeto del array

}


// Generar una pregunta con opciones
async function generarPregunta1() {

    try {
        limpiarContenedores();
        const paisCorrecto = await obtenerPaisDeCapital(); // Obtener el país correcto
        const capitalCorrecta = paisCorrecto.capital[0];
        const todosLosPaises = await conectar('/all'); // Obtener todos los países

        // Filtrar 3 países aleatorios que no sean el correcto
        const opcionesAleatorias = todosLosPaises
            .filter(country => country.name.common !== paisCorrecto.name.common)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        // // Combinar el país correcto con las opciones aleatorias
        const opciones = [paisCorrecto, ...opcionesAleatorias].sort(() => 0.5 - Math.random());

        //Crea la pregunta en el html
        const container = document.getElementById('pregunta');
        container.textContent = " ";
        container.textContent = `¿Cuál es el país de la siguiente ciudad capital: ${capitalCorrecta}? `;

        generarRadios(opciones);

        const radios = document.getElementsByName('pais');
        const boton = document.getElementById('boton-confirmar');
        boton.onclick = () => {

            let seleccionado = null; // Variable para guardar el radio seleccionado

            // Buscar el radio seleccionado
            for (const radio of radios) {
                if (radio.checked) {
                    seleccionado = radio.value;
                    break; // Salimos del bucle una vez encontrado

                }
            } validarRespuestas(seleccionado, paisCorrecto.name.common);
        };


    } catch (error) {
        throw error;
    }
}

//generarPregunta1();
seleccionarPregunta();





async function validarRespuestas(seleccionado, respuestaCorrecta) {
    // Validar la respuesta
    if (seleccionado) {
        if (seleccionado === respuestaCorrecta) {
            Swal.fire({
                icon: 'success',
                title: '¡Correcto!',
                text: '¡Respuesta correcta!',
                confirmButtonText: 'Siguiente pregunta',
            }).then((result) => {
                if (result.isConfirmed) {
                    seleccionarPregunta();
                }
            })

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `Respuesta incorrecta. La respuesta correcta es: ${respuestaCorrecta} `,
                confirmButtonText: 'Siguiente pregunta',
            }).then((result) => {
                if (result.isConfirmed) {
                    seleccionarPregunta();
                }
            })
        }
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Por favor, selecciona una opción.',
        });
    }
}

function limpiarContenedores() {
    // Limpiar el contenedor de la pregunta
    const preguntaContainer = document.getElementById('pregunta');
    preguntaContainer.textContent = '';

    // Limpiar el contenedor de las opciones
    const opcionesContainer = document.getElementById('opciones');
    opcionesContainer.innerHTML = '';

    // Limpiar el contenedor adicional (por ejemplo, banderas o mensajes)
    const paisContainer = document.getElementById('pais');
    paisContainer.innerHTML = '';

}

async function generarPreguntaBandera() {
    try {
        // limpiarContenedores(); // Limpia los elementos antes de cargar la pregunta

        const todosLosPaises = await conectar('/all'); // Obtener todos los países
        const paisCorrecto = todosLosPaises[Math.floor(Math.random() * todosLosPaises.length)];
        console.log(paisCorrecto); // Revisa si existe paisCorrecto y sus propiedades
        console.log(paisCorrecto.flags); // Verifica la propiedad 'flags'
        console.log(paisCorrecto.flags.png);
        const preguntaContainer = document.getElementById('pregunta');
        preguntaContainer.textContent = '¿Qué país está representado por esta bandera?';

        const paisContainer = document.getElementById('pais');
        paisContainer.innerHTML = `<img src="${paisCorrecto.flags.png}" alt="Bandera de ${paisCorrecto.name.common}" style="width:200px;height:auto;">`;

        const opcionesAleatorias = todosLosPaises
            .filter(country => country.name.common !== paisCorrecto.name.common)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        const opciones = [paisCorrecto, ...opcionesAleatorias].sort(() => 0.5 - Math.random());
        generarRadios(opciones);
        const radios = document.getElementsByName('pais');
        const boton = document.getElementById('boton-confirmar');
        boton.onclick = () => {

            let seleccionado = null; // Variable para guardar el radio seleccionado

            // Buscar el radio seleccionado
            for (const radio of radios) {
                if (radio.checked) {
                    seleccionado = radio.value;
                    break; // Salimos del bucle una vez encontrado

                }
            } validarRespuestas(seleccionado, paisCorrecto.name.common);
        };

    } catch (error) {
        console.error('Error al generar la pregunta de bandera:', error);
    }
}


function seleccionarPregunta() {
    const tipoPregunta = Math.floor(Math.random() * 3); // Genera un número entre 0 y 2
    switch (tipoPregunta) {
        case 0:
            generarPregunta1(); // Pregunta de capital
            break;
        case 1:
            generarPreguntaBandera(); // Pregunta de bandera
            break;
        case 2:
            generarPreguntaLimitrofes();
            break;
        default:
            console.error('Tipo de pregunta no reconocido');
    }
}


async function generarPreguntaLimitrofes() {
    try {
        limpiarContenedores(); 

        const todosLosPaises = await conectar('/all'); 
        const paisCorrecto = todosLosPaises[Math.floor(Math.random() * todosLosPaises.length)]; 

        // Obtener el número de países limítrofes del país correcto
        const numeroLimites = paisCorrecto.borders ? paisCorrecto.borders.length : 0;

        // Generar opciones aleatorias, incluyendo la respuesta correcta
        const opcionesAleatorias = [numeroLimites]; // Agregar la respuesta correcta
        while (opcionesAleatorias.length < 4) {
            const opcion = Math.floor(Math.random() * 10); // Generar un número aleatorio entre 0 y 10
            if (!opcionesAleatorias.includes(opcion)) { // Asegurar que no haya duplicados
                opcionesAleatorias.push(opcion);
            }
        }

        // Mezclar las opciones
        const opciones = opcionesAleatorias.sort(() => 0.5 - Math.random());

        // Mostrar la pregunta en el contenedor correspondiente
        const preguntaContainer = document.getElementById('pregunta');
        preguntaContainer.textContent = `¿Cuántos países limítrofes tiene ${paisCorrecto.name.common}?`;

        
        generarRadiosNumero(opciones); 

       
        const radios = document.getElementsByName('pais');
        const boton = document.getElementById('boton-confirmar');
        boton.onclick = () => {
            let seleccionado = null;

            // Buscar el radio seleccionado
            for (const radio of radios) {
                if (radio.checked) {
                    seleccionado = radio.value;
                    break;
                }
            }

            // Validar la respuesta seleccionada
            validarRespuestas(seleccionado, numeroLimites.toString());
        };
    } catch (error) {
        console.error("Error al generar la pregunta de países limítrofes:", error);
    }
}
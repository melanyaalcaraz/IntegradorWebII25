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
let contadorPreguntas= 0;
const maxPreguntas=10;

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

async function generarPregunta1() {
    try {
       
        if (contadorPreguntas >= maxPreguntas) {
            finalizarJuego(); // Llamar a una función para finalizar el juego
            return; // Detener el flujo si se alcanza el número máximo de preguntas
        }

        limpiarContenedores(); // Limpia la interfaz antes de generar una nueva pregunta
        contadorPreguntas++; // Incrementar el contador

        // Obtener el país correcto y su capital
        const paisCorrecto = await obtenerPaisDeCapital(); // Devuelve un país
        const capitalCorrecta = paisCorrecto.capital[0]; // Capital del país correcto

        // Obtener todos los países para generar opciones
        const todosLosPaises = await conectar('/all');

        // Filtrar 3 países aleatorios que no sean el correcto
        const opcionesAleatorias = todosLosPaises
            .filter(country => country.name.common !== paisCorrecto.name.common) // Excluir el país correcto
            .sort(() => 0.5 - Math.random()) // Mezclar aleatoriamente
            .slice(0, 3); // Tomar 3 países

        const opciones = [paisCorrecto, ...opcionesAleatorias].sort(() => 0.5 - Math.random());

        console.log(opciones); // Verificar que las opciones son válidas y consistentes

        // Crear la pregunta en el contenedor HTML
        const container = document.getElementById('pregunta');
        container.textContent = `¿Cuál es el país de la siguiente ciudad capital: ${capitalCorrecta}?`;

        // Llamar a generarRadios con las opciones ya procesadas
        generarRadios(opciones);

        // Configurar el evento para validar la selección
        const radios = document.getElementsByName('pais');
        const boton = document.getElementById('boton-confirmar');
        boton.onclick = () => {
            let seleccionado = null; // Variable para guardar el valor del radio seleccionado

            // Buscar el radio seleccionado
            for (const radio of radios) {
                if (radio.checked) {
                    seleccionado = radio.value;
                    break; // Salir del bucle una vez encontrado
                }
            }

            console.log("Seleccionado:", seleccionado); // Confirmar el valor seleccionado
            validarRespuestas(seleccionado, paisCorrecto.name.common); // Validar la respuesta
        };
    } catch (error) {
        console.error("Error al generar la pregunta:", error); // Manejar errores en consola
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
        if (contadorPreguntas >= maxPreguntas) {
            finalizarJuego(); // Llamar a una función para finalizar el juego
            return; // Detener el flujo si se alcanza el número máximo de preguntas
        }

        limpiarContenedores(); // Limpia la interfaz antes de generar una nueva pregunta
        contadorPreguntas++; // Incrementar el contador


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
async function generarPreguntaPais() {
    try {
        if (contadorPreguntas >= maxPreguntas) {
            finalizarJuego(); // Llamar a una función para finalizar el juego
            return; // Detener el flujo si se alcanza el número máximo de preguntas
        }

        limpiarContenedores(); // Limpia la interfaz antes de generar una nueva pregunta
        contadorPreguntas++; // Incrementar el contador


        const todosLosPaises = await conectar('/all'); // Obtener todos los países
        const paisCorrecto = todosLosPaises[Math.floor(Math.random() * todosLosPaises.length)]; // Seleccionar un país correcto

        // Obtener el idioma principal del país correcto
        const idiomasCorrectos = paisCorrecto.languages ? Object.values(paisCorrecto.languages) : [];
        const idiomaCorrecto = idiomasCorrectos.length > 0 ? idiomasCorrectos[0] : "Desconocido";

        // Generar tres opciones incorrectas aleatorias (otros países)
        const opcionesIncorrectas = todosLosPaises
            .filter(country => country.name.common !== paisCorrecto.name.common) // Excluir el país correcto
            .sort(() => 0.5 - Math.random()) // Mezclar aleatoriamente
            .slice(0, 3); // Tomar tres países aleatorios

        // Mezclar las opciones junto con el país correcto
        const opciones = [
            paisCorrecto, // País correcto
            ...opcionesIncorrectas // Países incorrectos
        ]
            .sort(() => 0.5 - Math.random()) // Mezclar todas las opciones
        // Convertir a formato esperado

        console.log(opciones); // Verificar que las opciones tienen el formato correcto

        // Mostrar la pregunta en el contenedor correspondiente
        const preguntaContainer = document.getElementById('pregunta');
        preguntaContainer.textContent = `¿En qué país se habla este idioma: ${idiomaCorrecto}?`;

        // Generar los radios con los nombres de los países
        generarRadios(opciones);

        // Configurar la validación de la respuesta cuando se haga clic en el botón
        const radios = document.getElementsByName('pais');
        const boton = document.getElementById('boton-confirmar');
        boton.onclick = () => {
            let seleccionado = null;

            // Buscar cuál radio fue seleccionado
            for (const radio of radios) {
                if (radio.checked) {
                    seleccionado = radio.value;
                    break;
                }
            }

            // Validar la respuesta seleccionada
            validarRespuestas(seleccionado, paisCorrecto.name.common);
        };
    } catch (error) {
        console.error("Error al generar la pregunta de países por idioma:", error);
    }
}

async function generarPreguntaLimitrofes() {
    try {
        if (contadorPreguntas >= maxPreguntas) {
            finalizarJuego(); // Llamar a una función para finalizar el juego
            return; // Detener el flujo si se alcanza el número máximo de preguntas
        }

        limpiarContenedores(); // Limpia la interfaz antes de generar una nueva pregunta
        contadorPreguntas++; // Incrementar el contador


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
function seleccionarPregunta() {
    const tipoPregunta = Math.floor(Math.random() * 4); // Genera un número entre 0 y 2
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
        case 3:
            generarPreguntaPais();
            break;
        default:
            console.error('Tipo de pregunta no reconocido');
    }
}

function finalizarJuego() {
    const preguntaContainer = document.getElementById('pregunta');
    preguntaContainer.textContent = "¡Juego terminado! Gracias por participar.";

    const opcionesContainer = document.getElementById('opciones');
    opcionesContainer.innerHTML = ''; 
    const opcionesPais = document.getElementById('pais');
    opcionesPais.innerHTML = '';// Limpiar las opciones

    const boton = document.getElementById('boton-confirmar');
    boton.onclick = null; // Deshabilitar el botón
}

if (contadorPreguntas <=10 ){
    seleccionarPregunta();
} else{
    finalizarJuego();
}
//Variables necesarias  
let contadorPreguntas = 0;       //Contador de preguntas
const maxPreguntas = 10;         // Maximo de preguntas
let respuestasCorrectas = 0;    // Contador de respuestas correctas
let respuestasIncorrectas = 0;  // Contador de respuestas incorrectas
let puntos = 0;                // Contador de puntos
let tiemposRespuesta = [];      // Array para almacenar los tiempos de respuesta de cada pregunta
let inicioPartida = null;      // Variable para registrar el tiempo inicial
let nombreJugador = "";        // Nombre del jugador
let inicioPregunta;

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

//Funcion para generar radios texto
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

//Funcion para generar radios numero
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

//Funcin para validar respuestas con sweetalert
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
            return true;
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
            return false;
        }
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Por favor, selecciona una opción.',
        });

    }
}

//Funcion para obtener capital, para pregunta de capitales
async function obtenerCapital() {
    const todosLosPaises = await conectar('/all');

    const paisConCapital = todosLosPaises
        .filter(country => country.capital && country.capital.length > 0)
        .sort(() => 0.5 - Math.random())
        .slice(0, 1);

    console.log("Hola " + paisConCapital[0].capital)

    return paisConCapital[0].capital;

}


//Funcion para obtener un pais de una capital, para pregunta de capitales
async function obtenerPaisDeCapital() {
    const capital = await obtenerCapital();

    console.log(capital);

    const endpoint = `/capital/${encodeURIComponent(capital)}`; // Sustituimos {capital} con la capital real
    const datos = await conectar(endpoint);

    console.log(datos[0])

    return datos[0]; // Retornamos el primer objeto del array

}


//Funcion para pregunta de capitales
async function generarPreguntaCapital() {
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
        boton.onclick = async () => {
            let seleccionado = null; // Variable para guardar el valor del radio seleccionado

            // Buscar el radio seleccionado
            for (const radio of radios) {
                if (radio.checked) {
                    seleccionado = radio.value;
                    break; // Salir del bucle una vez encontrado
                }
            }

            const esCorrecto = await validarRespuestas(seleccionado, paisCorrecto.name.common);
            if (esCorrecto == true) {
                puntos += 3;
                respuestasCorrectas++;
            } else if (esCorrecto == false) {
                respuestasIncorrectas++;
            }
        };
    } catch (error) {
        console.error("Error al generar la pregunta:", error); // Manejar errores en consola
    }
}


//Funcion para limpiar los contenedores
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


//Funcion para pregunta bandera
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
        boton.onclick = async () => {

            let seleccionado = null; // Variable para guardar el radio seleccionado

            // Buscar el radio seleccionado
            for (const radio of radios) {
                if (radio.checked) {
                    seleccionado = radio.value;
                    break; // Salimos del bucle una vez encontrado

                }
            }

            const esCorrecto = await validarRespuestas(seleccionado, paisCorrecto.name.common);
            if (esCorrecto == true) {
                puntos += 5;
                respuestasCorrectas++;
            } else if (esCorrecto == false) {
                respuestasIncorrectas++;
            }
        };

    } catch (error) {
        console.error('Error al generar la pregunta de bandera:', error);
    }
}


//Funcion para pregunta idioma(pregunta extra)
async function generarPreguntaIdioma() {
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
        boton.onclick = async () => {
            let seleccionado = null;

            // Buscar cuál radio fue seleccionado
            for (const radio of radios) {
                if (radio.checked) {
                    seleccionado = radio.value;
                    break;
                }
            }

            const esCorrecto = await validarRespuestas(seleccionado, paisCorrecto.name.common);
            if (esCorrecto == true) {
                puntos += 3;
                respuestasCorrectas++;
            } else if (esCorrecto == false) {
                respuestasIncorrectas++;
            }
        };
    } catch (error) {
        console.error("Error al generar la pregunta de países por idioma:", error);
    }
}


//Funcion para generar pregunta de paises limitrofes
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
        boton.onclick = async () => {
            let seleccionado = null;

            // Buscar el radio seleccionado
            for (const radio of radios) {
                if (radio.checked) {
                    seleccionado = radio.value;
                    break;
                }
            }

            // Validar la respuesta seleccionada
            validarRespuestas();
            const esCorrecto = await validarRespuestas(seleccionado, numeroLimites.toString());
            if (esCorrecto == true) {
                puntos += 3;
                respuestasCorrectas++;
            } else if (esCorrecto == false) {
                respuestasIncorrectas++;
            }
        };
    } catch (error) {
        console.error("Error al generar la pregunta de países limítrofes:", error);
    }
}

function guardarPartida(nombre, puntos, correctas, incorrectas, duracion) {
    fetch('https://backend-preguntados.vercel.app/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nombre,
            puntos,
            correctas,
            incorrectas,
            duracion
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log('Partida guardada:', data);
            Swal.fire({
                icon: 'success',
                title: '¡Puntaje guardado!',
                text: `Gracias por jugar, ${nombre}!`
            });
        })
        .catch(err => {
            console.error('Error al guardar partida:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el puntaje. Intentalo más tarde.'
            });
        });
}




// Función para generar preguntas sin orden
function seleccionarPregunta() {
    document.getElementById("boton-ranking").style.display = "none";
    document.getElementById("botones").style.display = "flex";
    document.getElementById("boton-confirmar").style.display = "inline-block";

    if (contadorPreguntas === 0) {
        inicioPartida = new Date(); // Registrar el inicio de la partida
    } else {
        // Registrar el tiempo de respuesta para la pregunta anterior
        const finPregunta = new Date();
        const duracionPregunta = (finPregunta - inicioPregunta) / 1000; // En segundos
        tiemposRespuesta.push(duracionPregunta);
    }

    // Registrar el inicio de la nueva pregunta
    inicioPregunta = new Date();

    const tipoPregunta = Math.floor(Math.random() * 4);
    switch (tipoPregunta) {
        case 0:
            generarPreguntaCapital();
            break;
        case 1:
            generarPreguntaBandera();
            break;
        case 2:
            generarPreguntaLimitrofes();
            break;
        case 3:
            generarPreguntaIdioma();
            break;
        default:
            console.error('Tipo de pregunta no reconocido');
    }

}

let jugadorListo = false; // Variable para controlar si el jugador está listo

function pedirNombre() {
    document.getElementById("botones").style.display = "none";
    const opciones = document.getElementById("opciones");
    opciones.innerHTML = ""; // Limpiar cualquier contenido previo

    // Crear el input de texto
    const input = document.createElement("input");
    input.type = "text";
    input.id = "nombreJugador";
    input.placeholder = "Escribe tu nombre";

    // Crear el botón
    const button = document.createElement("button");
    button.innerText = "Iniciar Juego";
    // Cambiar la id del botón
    button.id = "botonIniciar";

    // Manejar el clic del botón
    button.onclick = function () {
        // Obtener el nombre del jugador
        const nombre = document.getElementById("nombreJugador").value;

        // Verificar si el jugador ha ingresado un nombre
        if (nombre.trim() !== "") {
            nombreJugador = nombre;
            jugadorListo = true;  // Establecer que el jugador está listo
            seleccionarPregunta();
        } else {
            alert("Por favor, ingresa un nombre.");
            jugadorListo = false; // El jugador no está listo si no ingresó nombre
        }
    };

    // Agregar el input y el botón al contenedor
    opciones.appendChild(input);
    opciones.appendChild(button);
}


// Función para finalizar juego
function finalizarJuego() {
    document.getElementById("boton-confirmar").style.display = "none";
    document.getElementById("boton-ranking").style.display = "flex";
    const finPartida = new Date();
    const duracionPartida = (finPartida - inicioPartida) / 1000; // En segundos

    // Calcular el tiempo promedio de respuesta
    const tiempoPromedio = tiemposRespuesta.length > 0
        ? tiemposRespuesta.reduce((total, tiempo) => total + tiempo, 0) / tiemposRespuesta.length
        : 0;

    // Mostrar resultados en la interfaz
    const preguntaContainer = document.getElementById('pregunta');
    preguntaContainer.textContent = `¡Juego terminado! Gracias por participar ${nombreJugador.trim()}.`;

    const opcionesContainer = document.getElementById('opciones');
    opcionesContainer.innerHTML = `
        <br>
        Respuestas correctas: ${respuestasCorrectas} <br>
        Respuestas incorrectas: ${respuestasIncorrectas} <br>
        Puntos: ${puntos} <br>
        Duración total: ${Math.floor(duracionPartida / 60)}:${Math.floor(duracionPartida % 60)} <br>
        Tiempo promedio por pregunta: ${tiempoPromedio.toFixed(2)} segundos <br>
    `;

    document.getElementById('pais').innerHTML = ''; // Limpiar las opciones
    document.getElementById('boton-confirmar').onclick = null; // Deshabilitar el botón
    guardarPartida(nombreJugador.trim(), puntos, respuestasCorrectas, respuestasIncorrectas, duracionPartida);
    document.getElementById('boton-reiniciar').style.display = 'inline-block';

}

function mostrarRanking() {

    fetch('http://localhost:3000/api/ranking')
        .then(res => res.json())
        .then(data => {
            limpiarContenedores();
            document.getElementById("botones").style.display = "flex";
            document.getElementById("boton-reiniciar").style.display = "inline-block";
            document.getElementById("boton-confirmar").style.display = "none";
            const contenedor = document.getElementById('pais');
            contenedor.innerHTML = "<h2>Ranking Top 20: </h2>";

            const lista = document.createElement('ol');

            data.forEach((partida) => {
                const item = document.createElement('li');
                item.textContent = `${partida.nombre} - ${partida.puntos} pts - ${partida.correctas} ✔️ - ${partida.incorrectas} ❌ - ${partida.duracion}s`;
                lista.appendChild(item);
            });

            contenedor.appendChild(lista);
        })
        .catch(err => {
            console.error('Error al obtener el ranking:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el ranking.'
            });
        });
}


function reiniciarJuego() {
    // Reiniciar variables
    contadorPreguntas = 0;
    respuestasCorrectas = 0;
    respuestasIncorrectas = 0;
    puntos = 0;
    tiemposRespuesta = [];
    inicioPartida = null;
    inicioPregunta = null;



    // Limpiar pantalla
    limpiarContenedores();
    document.getElementById('pregunta').innerHTML = "";
    document.getElementById('boton-reiniciar').style.display = 'none';

    // Pedir el nombre de nuevo
    pedirNombre();
    // Empezar nueva partida
    // seleccionarPregunta();
}


if (contadorPreguntas <= 10) {
    if (pedirNombre() === true) {
        seleccionarPregunta();
    }


} else {
    finalizarJuego();
}


// async function conectar(endpoint, opciones = {})   
//     const urlBase = 'https://restcountries.com/v3.1';
//     const urlCompleta = `${urlBase}${endpoint}`;

//     try {
//         const respuesta = await fetch(urlCompleta, opciones);
//         if (!respuesta.ok) {
//             throw new Error(`Error: ${respuesta.status} - ${respuesta.statusText}`);
//         }
//         return await respuesta.json();
//     } catch (error) {
//         console.error('La conexión no funca:', error);
//         throw error;
//     }
// }

// function generarRadios(countries) {
//     const container = document.getElementById('opciones');
//     container.innerHTML = ''; // Limpiar cualquier contenido previo

//     countries.forEach(country => {
//         // Crear elemento radio
//         const radioOption = document.createElement('input');
//         radioOption.type = 'radio';
//         radioOption.name = 'pais';
//         radioOption.value = country.name.common;

//         // Crear etiqueta para el radio
//         const label = document.createElement('label');
//         label.textContent = country.name.common;

//         // Añadir el radio y la etiqueta al contenedor
//         const div = document.createElement('div'); // Agrupador
//         div.appendChild(radioOption);
//         div.appendChild(label);
//         container.appendChild(div);
//     });
// }

// async function generarPreguntaConOpciones() {
//     try {
//         const todosLosPaises = await conectar('/all');
//         const paisConCapital = todosLosPaises.filter(country => country.capital && country.capital.length > 0);

//         if (paisConCapital.length < 4) {
//             throw new Error('No hay suficientes países con capitales válidas para generar opciones.');
//         }

//         const paisCorrecto = paisConCapital[Math.floor(Math.random() * paisConCapital.length)];
//         const opcionesAleatorias = paisConCapital
//             .filter(country => country.name.common !== paisCorrecto.name.common)
//             .sort(() => 0.5 - Math.random())
//             .slice(0, 3);

//         const opciones = [paisCorrecto.name.common, ...opcionesAleatorias.map(o => o.name.common)]
//             .sort(() => 0.5 - Math.random());

//         generarRadios(opciones);
//     } catch (error) {
//         console.error('Error:', error.message);
//     }
// }

// await generarPreguntaConOpciones();


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

// Generar opciones de radio
function generarRadios(countries) {
    const container = document.getElementById('opciones');
    container.innerHTML = ''; // Limpiar cualquier contenido previo

    countries.forEach(country => {
        // Crear elemento radio
        const radioOption = document.createElement('input');
        radioOption.type = 'radio';
        radioOption.name = 'pais';
        radioOption.value = country.name.common;

        // Crear etiqueta para el radio
        const label = document.createElement('label');
        label.textContent = country.name.common;

        // Añadir el radio y la etiqueta al contenedor
        const div = document.createElement('div'); // Agrupador
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
    console.log("Hola "+ paisConCapital[0].capital)
    return paisConCapital[0].capital;
    
}

//Obtener el país de una capital específica
async function obtenerPaisDeCapital() {
    const capital= await obtenerCapital();
    console.log(capital);
    const endpoint = `/capital/${encodeURIComponent(capital)}`; // Sustituimos {capital} con la capital real
    const datos = await conectar(endpoint);
    console.log(datos[0])
    return datos[0]; // Retornamos el primer objeto del array

}


// Generar una pregunta con opciones
async function generarPreguntaConOpciones() {
    try {
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
        
         const container = document.getElementById('pregunta');
        container.textContent= " ";
          container.textContent = `¿Cuál es el país de la siguiente ciudad capital: ${capitalCorrecta}?`;
       


       generarRadios(opciones);

    } catch (error) {
        throw error;
    }
}

generarPreguntaConOpciones();
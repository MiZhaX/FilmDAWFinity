// Variables globales
var peticionEnCurso = false;
var totalPeliculas = [];
var tipoBusqueda = "movie";

// Incluir Google Charts
google.charts.load("current", { packages: ["corechart"] });

// Onload
window.onload = () => {
    const barra = document.getElementById("busqueda");
    const encontrados = document.getElementById("encontrados");
    const inputBusqueda = document.getElementById("busqueda");

    var pagina = 1;

    // Listener para la barra de busqueda
    barra.addEventListener("input", () => {
        var buscar = barra.value;
        // Realizar una busqueda si ya se han escrito mínimo 3 carácteres
        if (buscar.length >= 3) {
            pagina = 1;
            const url = `https://www.omdbapi.com/?apikey=2d3d2148&s=${buscar}&page=${pagina}&type=${tipoBusqueda}`;

            encontrados.style.display = "flex";

            peticionAjaxModerna(url, true);
        }
    });

    // Listener para el botón de búsqueda
    document.getElementById("btn").addEventListener("click", () => {
        var buscar = barra.value;
        pagina = 1;
        var url = `https://www.omdbapi.com/?apikey=2d3d2148&s=${buscar}&page=${pagina}&type=${tipoBusqueda}`;

        encontrados.style.display = "flex";

        peticionAjaxModerna(url, true);
    });

    // Listener para cambiar el tipo de búsqueda a películas
    document.getElementById("peliculas").addEventListener("click", () => {
        tipoBusqueda = "movie";
        inputBusqueda.placeholder = "Busca tu película favorita";

        var buscar = barra.value;
        pagina = 1;
        var url = `https://www.omdbapi.com/?apikey=2d3d2148&s=${buscar}&page=${pagina}&type=${tipoBusqueda}`;

        encontrados.style.display = "flex";

        peticionAjaxModerna(url, true);
    });

    // Listener para cambiar el tipo de búsqueda a series
    document.getElementById("series").addEventListener("click", () => {
        tipoBusqueda = "series";
        inputBusqueda.placeholder = "Busca tu serie favorita";

        var buscar = barra.value;
        pagina = 1;
        var url = `https://www.omdbapi.com/?apikey=2d3d2148&s=${buscar}&page=${pagina}&type=${tipoBusqueda}`;

        encontrados.style.display = "flex";

        peticionAjaxModerna(url, true);
    });

    // Listener para realizar el scroll infinito
    window.addEventListener("scroll", () => {
        const finalPagina = window.innerHeight + document.documentElement.scrollTop >= (document.body.offsetHeight * 0.7);

        // Si llega al límite y no hay ninguna petición en curso ejecuta la consulta
        if (finalPagina && !peticionEnCurso) {

            peticionEnCurso = true;
            pagina++;
            var buscar = barra.value;
            var url = `https://www.omdbapi.com/?apikey=2d3d2148&s=${buscar}&page=${pagina}&type=${tipoBusqueda}`;

            peticionAjaxModerna(url, false);
        }
    });

    // Listener para el botón de informes
    document.getElementById("informe").addEventListener("click", () => {
        const informe = document.getElementById("informe-contenedor");

        // Si se han buscado películas muestra el informe
        if(totalPeliculas.length > 0){
            informe.style.display = "flex";

            mostrarInforme();
        }
    });
}

// Función para realiar la petición
function peticionAjaxModerna(url, recarga) {
    const contenedor = document.getElementById("carga-contenedor");
    contenedor.style.visibility = "visible";

    fetch(url, { method: "GET" }).then((res) => res.json()).then((json) => {
        var lista = document.getElementById("lista");
        if (recarga) {
            lista.innerHTML = "";
            totalPeliculas = [];
        }

        var resultados = document.getElementById("encontrados");

        // Actualizar resultados
        if (json.totalResults) {
            resultados.innerText = `Se han encontrado ${json.totalResults} resultados`;
        } else {
            resultados.innerText = `Se han encontrado 0 resultados`;
        }

        // Si se han encontrado resultados mostrarlos
        if (json.Search) {
            json.Search.forEach(element => {
                // Añadir los datos de las películas para su posterior procesamiento en los informes
                fetch(`https://www.omdbapi.com/?apikey=2d3d2148&i=${element.imdbID}`, { method: "GET" })
                    .then((res) => res.json())
                    .then((json) => {
                        totalPeliculas.push(json);
                    });

                var pelicula = document.createElement("div");
                pelicula.className = "pelicula";

                var nombre = document.createElement("p");
                nombre.innerHTML = element.Title;
                nombre.innerHTML += " - " + element.Year;

                var poster = document.createElement("img");

                // Cargar imágen por defecto para el póster en caso de no tener una asignada
                if (element.Poster == "N/A") poster.setAttribute("src", "./img/generico.png");
                else poster.setAttribute("src", element.Poster);

                poster.className = "poster";
                poster.idpeli = element.imdbID;
                poster.addEventListener("click", pedirPelicula);

                pelicula.appendChild(nombre);
                pelicula.appendChild(poster);

                lista.appendChild(pelicula);
            });
        }

        console.log(json);
        contenedor.style.visibility = "hidden";
        peticionEnCurso = false;

        console.log(totalPeliculas);
    }).catch((err) => {
        console.error("Error: ", err);
        contenedor.style.visibility = "hidden";
        peticionEnCurso = false;
    });
}

// Función para pedir los datos de una película
function pedirPelicula(e) {
    const carga = document.getElementById("carga-contenedor");
    carga.style.visibility = "visible";

    const url = `https://www.omdbapi.com/?apikey=2d3d2148&i=${e.target.idpeli}`;

    // Crear los elementos
    const contenedor = document.createElement("div");
    contenedor.className = "contenedor";

    const detalles = document.createElement("div");
    detalles.className = "detalles";

    const botonCerrar = document.createElement("button");
    botonCerrar.className = "cerrar";
    botonCerrar.innerHTML = "x";
    botonCerrar.addEventListener("click", () => {
        document.body.removeChild(contenedor);
        document.body.style.overflow = "auto";
    });

    // Realizar la petición por la omdbID
    fetch(url, { method: "GET" })
        .then((res) => res.json())
        .then((json) => {
            // Rellenar los elementos con los datos
            detalles.innerHTML = `
                <h2>${json.Title} (${json.Year}, ${json.imdbRating}, ${json.Runtime})</h2>
                <p><strong>Director:</strong> ${json.Director}</p>
                <p><strong>Actors:</strong> ${json.Actors}</p>
                <p><strong>Plot:</strong> ${json.Plot}</p>`;

            if (json.Ratings && json.Ratings.length > 0) {
                detalles.innerHTML += `<strong>Ratings: </strong>`;
                json.Ratings.forEach(element => {
                    detalles.innerHTML += `${element.Source}: ${element.Value}, `;
                });
                detalles.innerHTML += `<br>`;
            }

            if (json.Poster === "N/A") {
                detalles.innerHTML += `<img src="./img/generico.png" alt="${json.Title}" style="max-width: 100%;">`;
            } else {
                detalles.innerHTML += `<img src="${json.Poster}" alt="${json.Title}" style="max-width: 100%;">`;
            }

            // Agregar los elementos al padre
            detalles.appendChild(botonCerrar);
            contenedor.appendChild(detalles);

            console.log(json);
            carga.style.visibility = "hidden";
        })
        .catch((err) => {
            console.error("Error: ", err);
            carga.style.visibility = "hidden";
        });

    document.body.appendChild(contenedor);
    document.body.style.overflow = "hidden";
}

// Función para mostrar los informes
function mostrarInforme() {
    const informes = document.getElementById("informes");
    const contenedor = document.getElementById("informe-contenedor");

    // Limpiar contenido previo
    informes.innerHTML = "";

    const botonCerrar = document.createElement("button");
    botonCerrar.className = "cerrar-informe";
    botonCerrar.innerHTML = "x";

    botonCerrar.addEventListener("click", () => {
        contenedor.style.display = "none";
        document.body.style.overflow = "auto";
    });

    informes.appendChild(botonCerrar);

    // Si el tipo de búsqueda es "serie", solo mostrar películas por valoración
    if (tipoBusqueda === "series") {
        // Almacenar películas mejor valoradas
        const pelisPorVal = [...totalPeliculas]
            .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
            .slice(0, 5);

        // Crear lista de mejor valoradas
        const listaValoracion = document.createElement("ol");
        listaValoracion.className = "listaValoracion";
        listaValoracion.innerHTML = `<h3>Mejor valoradas:</h3>`;
        pelisPorVal.forEach(element => {
            listaValoracion.innerHTML += `<li>${element.Title} - ${element.imdbRating}</li>`;
        });

        // Crear gráfico
        const graficoValoracion = document.createElement("div");
        graficoValoracion.id = "graficoValoracion";
        graficoValoracion.style.width = "300px";
        graficoValoracion.style.height = "200px";

        // Añadir lista y gráfico al informe
        informes.appendChild(listaValoracion);
        informes.appendChild(graficoValoracion);

        // Dibujar gráfico de mejor valoradas
        google.charts.setOnLoadCallback(() => {
            const dataVal = google.visualization.arrayToDataTable([
                ["Película", "Valoración IMDB"],
                ...pelisPorVal.map(p => [p.Title, parseFloat(p.imdbRating)])
            ]);

            const optionsVal = {
                title: "Mejor valoradas",
                backgroundColor: 'transparent',
                legend: 'none',
                titleTextStyle: {
                    color: 'white'
                },
                vAxis: {
                    textPosition: 'none' 
                },
                hAxis: {
                    textStyle: {
                        color: 'white' 
                    }
                }
            };
            const chartVal = new google.visualization.BarChart(graficoValoracion);
            chartVal.draw(dataVal, optionsVal);
        });
    }
    // Si el tipo de búsqueda es "movie", mostrar por valoradas, recaudación y votación
    else {
        // Almacenar películas mejor valoradas
        const pelisPorVal = [...totalPeliculas]
            .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
            .slice(0, 5);

        // Almacenar películas con más recaudación
        const pelisPorRec = [...totalPeliculas]
            .sort((a, b) => {
                const recA = parseInt(a.BoxOffice.replace(/[\$,]/g, "")) || 0;
                const recB = parseInt(b.BoxOffice.replace(/[\$,]/g, "")) || 0;
                return recB - recA;
            })
            .slice(0, 5);

        // Almacenar películas más votadas
        const pelisPorVot = [...totalPeliculas]
            .sort((a, b) => {
                const votA = parseInt(a.imdbVotes.replace(/,/g, "")) || 0;
                const votB = parseInt(b.imdbVotes.replace(/,/g, "")) || 0;
                return votB - votA;
            })
            .slice(0, 5);

        // Crear listas
        const listaValoracion = document.createElement("ol");
        listaValoracion.className = "listaValoracion";
        listaValoracion.innerHTML = `<h3>Mejor valoradas:</h3>`;
        pelisPorVal.forEach(element => {
            listaValoracion.innerHTML += `<li>${element.Title} - ${element.imdbRating}</li>`;
        });

        const listaRecaudacion = document.createElement("ol");
        listaRecaudacion.className = "listaRecaudacion";
        listaRecaudacion.innerHTML = `<h3>Más recaudación:</h3>`;
        pelisPorRec.forEach(element => {
            listaRecaudacion.innerHTML += `<li>${element.Title} - ${element.BoxOffice}</li>`;
        });

        const listaVotacion = document.createElement("ol");
        listaVotacion.className = "listaVotacion";
        listaVotacion.innerHTML = `<h3>Más votadas:</h3>`;
        pelisPorVot.forEach(element => {
            listaVotacion.innerHTML += `<li>${element.Title} - ${element.imdbVotes} votos</li>`;
        });

        // Contenedores para las gráficas
        const graficoValoracion = document.createElement("div");
        graficoValoracion.id = "graficoValoracion";
        graficoValoracion.style.width = "300px";
        graficoValoracion.style.height = "200px";

        const graficoRecaudacion = document.createElement("div");
        graficoRecaudacion.id = "graficoRecaudacion";
        graficoRecaudacion.style.width = "300px";
        graficoRecaudacion.style.height = "200px";

        const graficoVotacion = document.createElement("div");
        graficoVotacion.id = "graficoVotacion";
        graficoVotacion.style.width = "300px";
        graficoVotacion.style.height = "200px";

        // Añadir listas y gráficas al informe
        informes.appendChild(listaValoracion);
        informes.appendChild(graficoValoracion);

        informes.appendChild(listaRecaudacion);
        informes.appendChild(graficoRecaudacion);

        informes.appendChild(listaVotacion);
        informes.appendChild(graficoVotacion);

        // Dibujar las gráficas
        google.charts.setOnLoadCallback(() => {
            // Gráfico de mejor valoradas
            const dataVal = google.visualization.arrayToDataTable([
                ["Película", "Valoración IMDB"],
                ...pelisPorVal.map(p => [p.Title, parseFloat(p.imdbRating)])
            ]);

            const optionsVal = {
                title: "Mejor valoradas",
                backgroundColor: 'transparent',
                legend: 'none',
                titleTextStyle: {
                    color: 'white'
                },
                vAxis: {
                    textPosition: 'none' 
                },
                hAxis: {
                    textStyle: {
                        color: 'white' 
                    }
                }
            };
            const chartVal = new google.visualization.BarChart(graficoValoracion);
            chartVal.draw(dataVal, optionsVal);

            // Gráfico de más recaudación
            const dataRec = google.visualization.arrayToDataTable([
                ["Película", "Recaudación ($)"],
                ...pelisPorRec.map(p => [p.Title, parseInt(p.BoxOffice.replace(/[\$,]/g, "")) || 0])
            ]);

            const optionsRec = {
                title: "Más recaudación",
                backgroundColor: 'transparent',
                legend: 'none',
                titleTextStyle: {
                    color: 'white'
                },
                vAxis: {
                    textPosition: 'none' 
                },
                hAxis: {
                    textStyle: {
                        color: 'white'
                    }
                }
            };
            const chartRec = new google.visualization.BarChart(graficoRecaudacion);
            chartRec.draw(dataRec, optionsRec);

            // Gráfico de más votadas
            const dataVot = google.visualization.arrayToDataTable([
                ["Película", "Votos IMDB"],
                ...pelisPorVot.map(p => [p.Title, parseInt(p.imdbVotes.replace(/,/g, "")) || 0])
            ]);

            const optionsVot = {
                title: "Más votadas",
                pieHole: 0.3,
                backgroundColor: 'transparent',
                legend: 'none',
                titleTextStyle: {
                    color: 'white'
                }
            };
            const chartVot = new google.visualization.PieChart(graficoVotacion);
            chartVot.draw(dataVot, optionsVot);
        });
    }

    document.body.style.overflow = "hidden";
}

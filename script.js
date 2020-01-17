window.onload = () => {
    /**********************************TODO***********************************/

    //variable de referencia, (cantidad de paginas cargadas, en principio 1)
    page = 1;
    //variable de control de scroll, para que las peticiones vayan de 1 en 1
    sePuede = true
    //le damos al boton de busqueda el evento click

    DarEventoBoton();
    //le damos a window el evento que controla el scroll
    scrollInfinito(page, sePuede);

    /********************************END_TODO*********************************/
}

function DarEventoBoton() {
    //ajax que nos da las peliculas que coincidan con el buscador
    $(".busqueda").click(function () {
        $(".listado").html("");
        $.ajax({
            method: "get",
            url: "https://www.omdbapi.com/?s=" + $(".texto").val() + "&apikey=dc81505b",
            success: function (response) {
                $.each(response.Search, function (index, value) {
                    crearMain(value);
                })
            }
        });
    })
    $(".texto").on("keypress", function (e) {
        if (e.which == 13) {
            $(".listado").html("");
            $.ajax({
                method: "get",
                url: "https://www.omdbapi.com/?s=" + $(".texto").val() + "&apikey=dc81505b",
                success: function (response) {
                    $.each(response.Search, function (index, value) {
                        crearMain(value);
                    })
                }
            });
        }
    })
}

function scrollInfinito(page, sePuede) {
    //ajax que pide más peliculas a la api segun llegamos al final de la pagina
    $(window).scroll(function () {
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
            if (sePuede) {
                sePuede = false; //controlar que no se hagan más peticiones hasta que no termine una
                page++; //aumenta la pagina en la cual vamos a sacar la información
                $.ajax({
                    method: "get",
                    beforeSend: function () {//maquetamos una animación de cargando al final de la lista mientras carga la proxima pagina
                        if ($(".card").length > 0) {
                            if ($(".spinner-border").length == 0) {
                                $divSpinner = $("<div class=\"spinner-border cargando\"></div>");
                                $spanSpinner = $("<span class=\"sr-only\">Loading...</span");
                                $divSpinner.append($spanSpinner);
                                $(".container-fluid").append($divSpinner);
                            }
                        }
                    },
                    url: "https://www.omdbapi.com/?s=" + $(".texto").val() + "&apikey=dc81505b&page=" + page,
                    success: function (response) {
                        $.each(response.Search, function (index, value) {
                            crearMain(value);
                            console.log(value);
                        })
                    },

                }).done(function () {//cuando termina el ajax borramos el icono de cargando del final de la pagina
                    $(".spinner-border").remove();
                });
                sePuede = true;
            }
        }
    })
}

function crearMain(value) {
    //crea el listado de peliculas
    $card = $("<div class=\"col-md-4 card col-lg-3 mt-3 mb-3 m-md-3\"></div>");
    if (value.Poster != "N/A")//por si la pelicula no tiene imagen
        $image = $("<img src=\"" + value.Poster + "\" class=\"mt-2 img-fluid imagen\">");
    else
        $image = $("<img src=\"defecto.png\" class=\"mt-2 img-fluid imagen\">");//pelicula por defecto si no tiene imagen
    $cardBody = $("<div class=\"card-body\"></div>");
    $cardTitle = $("<h5 class=\"card-title\"></h5>").text(value.Title);
    $boton = $("<a href=\"#\" class=\"btn btn-danger detalles\" data-toggle=\"modal\" data-target=\"#staticBackdrop\"></a>").text("Detalles");
    $boton.click(() => {
        getDetalles(value); //peticion ajax a los detalles de la pelicula (se lanzará otro evento para crear el modal)
    });
    $cardBody.append($cardTitle);
    $cardBody.append($boton);
    $card.append($image);
    $card.append($cardBody)
    $(".listado").append($card);
}

function getDetalles(value) {
    //ajax con la peticion a la api con el id de pelicula
    $(".modal:hidden").remove();
    $.ajax({
        method: "get",
        url: "https://www.omdbapi.com/?i=" + value.imdbID + "&apikey=dc81505b",
        success: function (response) {
            //crea los detalles que apareceran en el modal
            crearDetalle(response);
            //para que al pulsar el boton se muestre el modal
            $("#staticBackdrop").modal({
                show: true
            });
        },
        error: function () {
            console.log("error");
        }
    })

}

function crearDetalle(response) {
    //crea la base del modal
    $modal = $("<div id=\"staticBackdrop\" class=\"modal fade bd-example-modal-xl\"  id=\"staticBackdrop\" data-backdrop=\"static\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"staticBackdropLabel\" aria-hidden=\"true\"></div>");
    $modalDialog = $("<div class=\"modal-dialog bg-danger content-fluid modal-body modal-xl\" role=\"document\"></div>");
    $modalDialog.append(crearContenidoDetalle(response));
    $modal.append($modalDialog);
    $(".container-fluid").append($modal);
}

function crearContenidoDetalle(response) {
    //el modal
    $contenido = $("<div class=\"modal-content\"></div>");

    //la cabecera del modal
    $headerCerrar = $("<div class=\"modal-header\"></div>");
    $botonCerrar = $("<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"></div>");
    $spanCerrar = $("<span aria-hidden=\"true\">&times;</span>");
    $botonCerrar.append($spanCerrar);
    $headerCerrar.append($botonCerrar);
    $contenido.append($headerCerrar);

    //cuerpo del modal
    $filaContenido = $("<div class=\"row modal-body\"></div>");

    //imagen de la pelicula
    $columnaImagen = $("<div class=\"col-md-6 col-xl-4 \"><div>");
    if (response.Poster != "N/A")
        $image = $("<img src=\"" + response.Poster + "\" class=\"m-2 img-fluid imagen\">");
    else
        $image = $("<img src=\"defecto.png\" class=\"m-2 img-fluid imagen\">");
    $columnaImagen.append($image);

    //detalle de la pelicula
    $columnaDetalle = $("<div class=\"col-md-6 col-xl-8 mt-4\"><div>"); //contenedor total

    //fila con el total
    $filaColumnaDetalle = $("<div class=\"row\"></div>");

    //columna del titulo
    $columnaTitulo = $("<div class=\"col-8 mb-2\"></div>");
    $titulo = $("<h1></h1>").text(response.Title);
    $columnaTitulo.append($titulo);
    $filaColumnaDetalle.append($columnaTitulo);

    //columna de puntuacion
    $columnaPuntuacion = $("<div class=\"col-4\"></div>");
    $puntuacion = $("<strong class=\"btn btn-danger mt-2 mb-2\"></strong>").text(response.imdbRating);
    $columnaPuntuacion.append($puntuacion);
    $filaColumnaDetalle.append($columnaPuntuacion);

    //columna del tipo
    $columnaTipo = $("<div class=\"col-6 mb-2\"></div>");
    $tipo = $("<h3></h3>").text(response.Type);
    $columnaTipo.append($tipo);
    $filaColumnaDetalle.append($columnaTipo);


    //columna del año
    $columnaYear = $("<div class=\"col-6 mb-2\"></div>");
    $year = $("<h3></h3>").text(response.Year);
    $columnaYear.append($year);
    $filaColumnaDetalle.append($columnaYear);

    //columna del plot
    $columnaPlot = $("<div class=\"col-12 mb-2\"></div>");
    $plot = $("<em></em>").text(response.Plot);
    $columnaPlot.append($plot);
    $filaColumnaDetalle.append($columnaPlot);

    //columna del lenguaje
    $columnaLan = $("<div class=\"col-12\"></div>");
    $lan = $("<strong></strong>").text(response.Language);
    $columnaLan.append($lan);
    $filaColumnaDetalle.append($columnaLan);

    //columna de actores
    $columnaActores = $("<div class=\"col-12 mt-3\"></div>");
    $actores = $("<em></em>").text(response.Actors);
    $columnaActores.append($actores);
    $filaColumnaDetalle.append($columnaActores);

    //añadir el contenido de la fila detalle en la columna de detalle 
    $columnaDetalle.append($filaColumnaDetalle);

    //añadimos las dos columnas a la fila del total
    $filaContenido.append($columnaImagen);
    $filaContenido.append($columnaDetalle);

    //añadimos el total a nuestro modal
    $contenido.append($filaContenido);

    //retornamos el modal que será insertado
    return $contenido;
}
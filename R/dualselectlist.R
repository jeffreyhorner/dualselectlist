#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
dualselectlist <- function(items, selected_items=NULL, input_name, width = NULL, height = NULL) {

  # forward options using x
  x = list(
    input_name = input_name,
    items = items,
    selected_items = selected_items
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'dualselectlist',
    x,
    width = width,
    height = height,
    package = 'dualselectlist'
  )
}

#' Shiny bindings for dualselectlist
#'
#' Output and render functions for using dualselectlist within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a dualselectlist
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name dualselectlist-shiny
#'
#' @export
dualselectlistOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'dualselectlist', width, height, package = 'dualselectlist')
}

#' @rdname dualselectlist-shiny
#' @export
renderDualselectlist <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, dualselectlistOutput, env, quoted = TRUE)
}

#' @export
updateDualselectlist <- function(outputId, items, selected_items, session){
  session$sendCustomMessage("updatedualselectlist",
    list(
      outputId=outputId,
      items=items,
      selected_items=selected_items
    )
  )
}

.onLoad <- function(libname, pkgName){
  shiny::registerInputHandler("dualselectlist", function(data, ...) {
    if (is.null(data))
      NULL
    else
      as.character(data)
  }, force = TRUE)
}

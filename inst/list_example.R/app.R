#
# This is a Shiny web application. You can run the application by clicking
# the 'Run App' button above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)
library(dualselectlist)

data(mtcars)

# Define UI for application that draws a histogram
ui <- fluidPage(

   # Application title
   titlePanel("Dual Select List"),

   sidebarLayout(
      sidebarPanel(
        checkboxGroupInput("cars","Cars",rownames(mtcars))
      ),

      mainPanel(
        dualselectlistOutput("dsl"),
        textOutput("selected")
      )
   )
)

# Define server logic required to draw a histogram
server <- function(input, output, session) {

  observeEvent(input$cars, {
    updateDualselectlist('dsl',input$cars,input$dsl_select,session)
  })

   output$dsl <- renderDualselectlist({
     dualselectlist(NULL,NULL,'dsl_select')
   })

   output$selected <- renderText({
     paste(input$dsl_select,collapse=', ')
   })
}

# Run the application
shinyApp(ui = ui, server = server)


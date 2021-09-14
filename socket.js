/**
 * To block scope everything we do here
 */
(() => {
     /**
   * Very "complex" reload system
   */
     const ws = new WebSocket("ws://localhost:5050")

     ws.onmessage = () => location.reload()

     /**
      * Inject a fake iGEM Top Menu
      */
     const topmenu = document.createElement("div")

     topmenu.setAttribute("style", "position: fixed; width: 100%; top: 0px; left: 0px; height: 16px; background-color: #383838; border-bottom: 2px solid black; z-index: 9999;")

     window.addEventListener("load", () => document.body.prepend(topmenu))
})();
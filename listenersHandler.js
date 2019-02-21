let currentListener = () => 0;

function startListening(f) {
    console.log("listening", f);
    currentListener = f;
}

function doneListening() {
    currentListener = () => 0;
}

function updateListener(mouseEvent) {
    console.log("emosido invocado");
    currentListener(mouseEvent);
    doneListening();
}
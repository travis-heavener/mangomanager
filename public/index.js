// Connect to web socket
document.addEventListener("DOMContentLoaded", () => {
    const ws = new WebSocket(`ws://${location.hostname}:5589/`);
    ws.addEventListener("open", () => {
        // Bind receiver
        ws.addEventListener("message", (e) => {
            const data = JSON.parse(e.data);
            console.log(data);
        })
    });
});
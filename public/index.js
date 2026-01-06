// Connect to web socket
$(() => {
    const ws = new WebSocket(`ws://${location.hostname}:5589/`);
    ws.addEventListener("open", () => {
        // Bind receiver
        ws.addEventListener("message", (e) => updateDisplay(JSON.parse(e.data)))
    });
});

const clamp = (min, max, n) => Math.max(min, Math.min(max, n));

const updateDisplay = (data) => {
    console.log(data);

    // CPU
    $("#cpu-caption > span").text(data.cpu.name);
    $("#cpu-speed").text(`${data.cpu.numCores} cores @ ${parseInt(data.cpu.currentSpeed * 1e3)} MHz`);
    $("#cpu-usage-wheel").css("--wheelRot", `${clamp(0, 300, data.cpu.load * 3)}deg`);
    $("#cpu-usage-percent").text(clamp(0, 100, parseInt(data.cpu.load)) + "%");

    // Battery (if present)
    if (!data.battery.hasBattery) {
        $("#battery-section").css("display", "none");
    } else {
        $("#battery-percent-wheel").css("--wheelRot", `${clamp(0, 300, data.battery.percent * 3)}deg`);
        $("#battery-percent").text(clamp(0, 100, parseInt(data.battery.percent)) + "%");
        $("#battery-charging-status").text((data.battery.isCharging ? "" : "Not ") + "Charging");
    }
};
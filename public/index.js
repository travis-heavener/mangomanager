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
    $("#cpu-speed").text(`${data.cpu.numCores} cores - ${parseInt(data.cpu.currentSpeed * 1e3)} MHz - ${data.cpu.temp === null ? '??' : parseInt(data.cpu.temp)}°C`);
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

    // RAM
    const ramUsedPercent = 100 * data.ram.used / data.ram.total;
    $("#ram-speed").text(`${(data.ram.total / (2 ** 30)).toFixed(0)} GiB @ ${parseInt(data.ram.baseSpeed)} MT/s`);
    $("#ram-percent-wheel").css("--wheelRot", `${clamp(0, 300, ramUsedPercent * 3)}deg`);
    $("#ram-percent").text(clamp(0, 100, parseInt(ramUsedPercent)) + "%");
    $("#ram-caption > span").text(`${(data.ram.used / (2 ** 30)).toFixed(1)} GiB used`);

    // OS info
    $("#os-hostname").text(data.os.hostname);
    $("#os-arch").text(data.os.arch);
    $("#os-platform").text(data.os.platform);
    $("#os-gpus").text(data.gpus.map(g => `${g.name} (${(g.totalVram / (2 ** 30)).toFixed(0)} GiB)`).join(", "));

    // Add storage info
    for (const drive of data.storage.reverse()) {
        // Determine new stats
        const usedGB = (drive.size - drive.free) / (2 ** 30);
        const totalGB = drive.size / (2 ** 30);
        const usedPercent = (1 - (drive.free / drive.size)) * 100;

        // Update display
        const id = "drive-section-" + drive.name.replaceAll(/[^\w]/g, "-");
        const jSection = $("#" + id);
        if (jSection.length === 0) {
            // Create new widget
            $("#ram-section").after(`
                <section id="${id}" class="drive-section">
                    <h2>Drive - ${drive.name}</h2>
                    <div class="wrapper">
                        <div class="wheel" style="--wheelRot: ${clamp(0, 300, usedPercent * 3)}deg">
                            <div></div>
                            <h5><em>${usedPercent.toFixed(1)}%</em></h5>
                        </div>
                        <h3><span>${usedGB.toFixed(1)} GiB used</span></h3>
                    </div>
                    <h4>${parseInt(totalGB)} GiB - ${drive.type}</h4>
                </section>
            `);
        } else {
            // Update existing
            $(`#${id} h3`).text(`${usedGB.toFixed(1)} GiB used`);
            $(`#${id} h4`).text(`${parseInt(totalGB)} GiB - ${drive.type}`);
            $(`#${id} h5`).text(`${usedPercent.toFixed(1)}%`);
            $(`#${id} > .wrapper > .wheel`).css("--wheelRot", `${clamp(0, 300, usedPercent * 3)}deg`);
        }
    }
};
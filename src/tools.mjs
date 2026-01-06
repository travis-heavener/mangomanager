import si from "systeminformation";

export const debug = {
    "log": (...args) => console.log("[Mango]", ...args)
};

export const telemetry = {};

// Iteratively collect telemetry
export const collectTelemetry = async () => {
    return new Promise((resolve, reject) => {
        const data = {
            cpu: {
                name: null,
                baseSpeed: null,
                numCores: null,
                temp: null,
                load: null
            },
            ram: {
                total: null,
                used: null,
                baseSpeed: null
            },
            gpus: [],
            storage: [],
            os: {
                platform: null,
                arch: null,
                hostname: null
            },
            battery: {
                percent: null,
                isCharging: null,
                hasBattery: null
            }
        };

        // Event bind handler
        let numReqs = 0, numResolved = 0;
        const bindReq = (func, callback) => {
            ++numReqs;
            func().then((...args) => {
                callback(...args);
                ++numResolved;

                if (numResolved === numReqs) {
                    Object.assign(telemetry, data);
                    setTimeout(collectTelemetry, 5000);
                    resolve(telemetry);
                }
            });
        };

        // CPU
        bindReq(si.cpu, c => {
            data.cpu.name = c.brand;
            data.cpu.numCores = c.physicalCores;
            data.cpu.baseSpeed = c.speed;
        });
        bindReq(si.cpuTemperature, t => data.cpu.temp = t.main);
        bindReq(si.currentLoad, t => data.cpu.load = t.currentLoad);

        // RAM
        bindReq(si.mem, m => (data.ram.total = m.total, data.ram.used = m.used));
        bindReq(si.memLayout, m => data.ram.baseSpeed = m[0].clockSpeed);

        // GPU
        // Select ONLY the first GPU
        // (SLI is dead and we have killed it)
        bindReq(si.graphics, g => {
            g.controllers.forEach(c => {
                data.gpus.push({
                    name: c.model,
                    totalVram: c.vram * 1e6
                })
            });
        });

        // Storage
        bindReq(si.fsSize, ds => {
            ds.forEach(d => {
                data.storage.push({
                    name: d.fs,
                    type: d.type,
                    size: d.size,
                    free: d.available
                });
            });
        });

        // OS
        bindReq(si.osInfo, o => {
            data.os.platform = o.platform;
            data.os.arch = o.arch;
            data.os.hostname = o.hostname;
        });

        // Battery
        bindReq(si.battery, b => {
            data.battery.hasBattery = b.hasBattery;
            data.battery.percent = b.percent;
            data.battery.isCharging = b.isCharging;
        });
    });
};

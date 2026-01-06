import express from "express";
import fs from "fs";
import os from "os";
import path from "path";
import { exit } from "process";
import { WebSocketServer } from "ws";

import { debug, collectTelemetry } from "./tools.mjs";

// Resolve paths
const publicPath = path.join(import.meta.dirname, "../public");
const configPath = path.join(import.meta.dirname, "../conf/config.json");

// Load config.json
const config = {};
const WSS_PORT = 5589;
{
    if (!fs.existsSync(configPath)) {
        debug.log("Missing conf/config.json, aborting...");
        exit(1);
    }

    // Read config
    let raw;
    try {
        raw = fs.readFileSync( configPath, "utf-8" );
    } catch (_) {
        debug.log("Failed to read conf/config.json, aborting...");
        exit(1);
    }

    // Parse config
    try {
        Object.assign(config, JSON.parse(raw));
    } catch (_) {
        debug.log("Failed to parse conf/config.json, aborting...");
        exit(1);
    }

    // Log success
    if (config.enableVerboseLogs)
        debug.log("Loaded conf/config.json!");
}

// Fetch local IP
let hostIP = null;
{
    const netInts = os.networkInterfaces();
    if (netInts.length === 0) {
        debug.log("No network intefaces found, aborting...");
        exit(1);
    }

    for (const alias of Object.entries(netInts)[0][1]) {
        if (alias.family === "IPv4" && alias.address !== "127.0.0.1") {
            hostIP = alias.address;
        }
    }

    if (hostIP === null) {
        debug.log("Failed to determine host IP address, aborting...");
        exit(1);
    }
}

// Create Express app
const app = express();
app.use(express.static(publicPath));
app.listen(
    config.port,
    () => {
        // Log success
        debug.log(`Live at http://${hostIP}:${config.port}`)

        // Open web socket
        const wss = new WebSocketServer({ port: WSS_PORT });
        debug.log(`Web socket live at ws://${hostIP}:${WSS_PORT}`);
        wss.on("connection", (ws) => {
            ws.on("error", debug.log);

            // Periodically send data
            let interval;

            interval = setInterval(() => {
                ws.send(
                    JSON.stringify(collectTelemetry())
                );
            }, 1000);

            // Configure interval close
            ws.on("close", () => clearInterval(interval));
        });
    }
);

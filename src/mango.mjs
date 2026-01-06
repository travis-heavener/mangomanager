import dgram from "dgram";
import express from "express";
import fs from "fs";
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

// Grab local IP from outbound connection (e.g. Google DNS)
let hostIP = null;
try {
    hostIP = await new Promise((resolve, _) => {
        const socket = dgram.createSocket("udp4");
        socket.connect(80, "8.8.8.8", () => {
            const address = socket.address();
            socket.close();
            resolve(address.address);
        });
    });
} catch (e) {
    debug.log("Failed to determine host IP address, aborting...");
    exit(1);
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
            const resend = async () => {
                ws.send( JSON.stringify(await collectTelemetry()) );
            };
            let interval;
            interval = setInterval(resend, 5000);
            resend(); // Initial invocation

            // Configure interval close
            ws.on("close", () => clearInterval(interval));
        });
    }
);

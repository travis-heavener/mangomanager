import express from "express";
import fs from "fs";
import os from "os";
import path from "path";
import { exit } from "process";

import { debug } from "./tools.mjs";

// Load config.json
const config = {};
{
    const configPath = path.join(import.meta.dirname, "../conf/config.json");
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
app.listen(
    config.port,
    () => debug.log(`Live at http://${hostIP}:${config.port}`)
);
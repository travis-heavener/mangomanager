import os from "os";

export const debug = {
    "log": (...args) => console.log("[Mango]", ...args)
};

export const collectTelemetry = () => {
    const data = {};

    // CPU
    data.cpu = {};
    
    // RAM
    data.ram = {};
    
    // GPU
    data.gpu = {};
    
    // Storage
    data.storage = {};
    
    // OS
    data.os = {};
    
    return data;
};
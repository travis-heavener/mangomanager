<div align="center">
    <img src="icons/readme-icon.jpg" width="300" height="158">
    <br>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-purple.svg"></a>
    <img src="https://img.shields.io/badge/Language-JavaScript-orange">
    <img src="https://img.shields.io/github/stars/travis-heavener/mangomanager?style=flat&label=Stars&color=white">
    <br>
    <h1>MangoManager</h1>
</div>

<div align="center">
    <h3><em>A LAN-based hardware monitor</em></h3>
    <h3>Project by Travis Heavener</h3>
</div>

---

## About

MangoManager (or simply "Mango") is a LAN hardware resource manager that allows other
network devices to view the host device's hardware utilization in the browser.

I mainly created this to work on my knowledge of web sockets, and to serve as my first
project for 2026.

## Configuration

1. Install [Node.js](https://nodejs.org/).
2. In the root directory of this project, run `npm i` to install required packages.
3. Copy the configuration file "conf/config.sample.json" to "conf/config.json" and adjust to your liking.
4. In the same directory, run `npm run dev` to start Mango.
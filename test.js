const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body><canvas id="gameCanvas"></canvas><div id="start-screen"></div><div id="settings-screen"></div><div id="game-over-screen"></div><div id="hud"></div><div id="score"></div><div id="lives"></div><div id="final-score"></div><button id="start-btn"></button><button id="settings-btn"></button><button id="close-settings-btn"></button><button id="restart-btn"></button><div id="style-options"></div><div id="color-options"></div><canvas id="previewCanvas"></canvas></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.requestAnimationFrame = () => {};
global.Math.hypot = Math.hypot;

require('fs').readFile('temp.js', 'utf8', (err, data) => {
    eval(data);
    console.log("Evaluation successful");
});

const doc = {
    getElementById: (id) => ({
        getContext: () => ({
            clearRect: () => {},
            save: () => {},
            restore: () => {},
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            closePath: () => {},
            fillRect: () => {},
            createRadialGradient: () => ({ addColorStop: () => {} })
        }),
        addEventListener: () => {},
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {} },
        style: {}
    }),
    createElement: () => ({
        addEventListener: () => {},
        classList: { add: () => {}, remove: () => {} },
        style: {}
    }),
    querySelectorAll: () => []
};
global.document = doc;
global.window = { addEventListener: () => {}, innerWidth: 800, innerHeight: 600 };
global.requestAnimationFrame = () => {};
global.Math.hypot = Math.hypot;

require('fs').readFile('temp.js', 'utf8', (err, data) => {
    try {
        eval(data);
        console.log("Evaluation successful");
        // Simulate click on settings button
        updatePreview();
        console.log("updatePreview successful");
    } catch(e) {
        console.error(e);
    }
});

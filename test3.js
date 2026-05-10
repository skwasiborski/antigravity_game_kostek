const { JSDOM } = require('jsdom');
const fs = require('fs');

JSDOM.fromFile("index.html", {
  runScripts: "dangerously",
  resources: "usable"
}).then(dom => {
  const window = dom.window;
  console.log("DOM loaded");
  
  // Wait a bit for scripts to execute
  setTimeout(() => {
    try {
      console.log("gameState:", window.gameState);
      
      const settingsBtn = window.document.getElementById('settings-btn');
      if (!settingsBtn) throw new Error("settingsBtn not found");
      
      console.log("Clicking settings...");
      settingsBtn.click();
      console.log("Settings clicked.");
      
      console.log("gameState is now:", window.gameState);
      
      // Check for errors
    } catch (e) {
      console.error("Test failed:", e);
    }
  }, 1000);
}).catch(e => {
  console.error("JSDOM error:", e);
});

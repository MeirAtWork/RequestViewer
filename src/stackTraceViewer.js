import netStack from "netstack.js"
import './stackTraceStyle.css'

export function setupStackTraceViewer(element, text) {
    createCopyButton(element, text);
    createStackViewer(element, text)
}

function createStackViewer(element, text) {
    const stackDiv = document.createElement("div");
    stackDiv.textContent = text;
    stackDiv.style.overflow = 'auto';  // show the scrollbar
    stackDiv.style.whiteSpace = 'pre'; // make 'at' in its own line
    const stack = new netStack(stackDiv, {
        prettyprint: true
    });
    element.appendChild(stackDiv);
}

function createCopyButton(element, text) {
    const button = document.createElement("button");
    button.textContent = "Copy";
    button.style.position = "absolute";
    button.style.right = "10px";
    button.style.background = "transparent";
    button.style.color = "rgb(93, 93, 93)";
    button.style.border = "none";
    button.style.padding = "5px 10px";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.fontSize = "12px";
    
    button.addEventListener("click", () => {
        navigator.clipboard.writeText(text).then(() => {
        button.textContent = "Copied!";
        setTimeout(() => (button.textContent = "Copy"), 1500);
        });
    });
    
    element.style.position = "relative";
    element.appendChild(button);
}

// Expose it to the global scope
// not needed for the playground
window.setupStackTraceViewer = setupStackTraceViewer;
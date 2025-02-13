import { ViewPlugin } from "@codemirror/view";

export function setupCopyToClipboardPlugin() {
    const copyButtonPlugin = ViewPlugin.define((view) => {
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
          navigator.clipboard.writeText(view.state.doc.toString()).then(() => {
            button.textContent = "Copied!";
            setTimeout(() => (button.textContent = "Copy"), 1500);
          });
        });
      
        view.dom.style.position = "relative";
        view.dom.appendChild(button);
      
        return {
          destroy() {
            button.remove(); // Cleanup when plugin is removed
          }
        };
      });
    
    return copyButtonPlugin;
}
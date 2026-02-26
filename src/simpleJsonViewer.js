// Export as a global function for ASP.NET use without imports
window.createJsonViewer = function(container, data) {
    return new SimpleJsonViewer(container, data);
};

class SimpleJsonViewer {
    constructor(container, data) {
        this.container = container;
        this.data = typeof data === 'string' ? JSON.parse(data) : data;
        this.lines = []; // Stores { el, lineNo, depth, type, ... }
        this.searchMatches = [];
        this.currentMatchIndex = -1;
        
        // CSS Setup
        // Check if style is already loaded (by ID or if we are in a dev environment that injected it)
        // We look for the ID we set ourselves.
        if (!document.getElementById('simple-json-viewer-style')) {
            // Check if we are in environment where CSS might be imported via JS (bundlers often inject <style> tags)
            // It's hard to detect if the style is already applied without checking computed styles or a marker.

            // Fallback: Try to inject the link, but only if not found.
            // If the user imports the CSS in their bundler, they should either give it this ID 
            // OR we can make this logic optional via config?
            // For now, let's just try to load it. 
            // To support the "Vite Dev" case where we might import it in main.js:
            // If main.js imports it, it's in a <style> tag.
            // If we add the link, it might be redundant or fail (404).
            
            // Allow disabling auto-css via global flag or something? 
            // No, let's just try to find the file.
            
            const link = document.createElement('link');
            link.id = 'simple-json-viewer-style';
            link.rel = 'stylesheet';
            link.href = 'simpleJsonViewer.css'; 
            
            // Only append if it looks like it's needed? 
            // We append. If 404, it's just a console error.
            document.head.appendChild(link);
        }

        this.initDOM();
        this.render(); // Initial Render
        this.initEvents();
    }

    initDOM() {
        this.container.classList.add('json-viewer-container');
        this.container.innerHTML = '';
        
        // --- Restructure for Fixed Search Panel ---
        // We create an INNER container that scrolls.
        // The OUTER container (this.container) will be relative and hide overflow.
        // The Search Panel will be absolute inside OUTER.
        
        // Apply inline styles
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden'; 
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        
        // Make container focusable so it can capture key events
        if (!this.container.hasAttribute('tabindex')) {
            this.container.setAttribute('tabindex', '0');
        }
        this.container.style.outline = 'none'; // distinct focus style if desired, or none

        // Search Panel (Appended to OUTER)
        this.searchPanel = document.createElement('div');
        this.searchPanel.className = 'json-viewer-search-panel hidden';
        this.searchPanel.innerHTML = `
            <input type="text" class="json-search-input" placeholder="Search...">
            <button class="json-search-btn prev" title="Previous match">
                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00004 5.58579L4.70715 8.87868L3.29294 7.46447L8.00004 2.75736L12.7071 7.46447L11.2929 8.87868L8.00004 5.58579Z" transform="translate(0, 2)"/>
                </svg>
            </button>
            <button class="json-search-btn next" title="Next match">
                <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00004 10.4142L11.2929 7.12132L12.7071 8.53553L8.00004 13.2426L3.29294 8.53553L4.70715 7.12132L8.00004 10.4142Z" transform="translate(0, -2)"/>
                </svg>
            </button>
            <span class="search-count" style="margin-left:5px; font-size: 11px; color:#666; min-width: 60px;"></span>
            <button class="json-search-btn close" title="Close">
                <svg width="15" height="15" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 8.70711L11.6464 12.3536L12.3536 11.6464L8.70711 8L12.3536 4.35355L11.6464 3.64645L8 7.29289L4.35355 3.64645L3.64645 4.35355L7.29289 8L3.64645 11.6464L4.35355 12.3536L8 8.70711Z"/></svg>
            </button>
        `;
        this.container.appendChild(this.searchPanel);

        // Scroll Wrapper (The actual scrollable area)
        const scrollWrapper = document.createElement('div');
        scrollWrapper.className = 'json-viewer-scroll-view';
        scrollWrapper.style.flex = '1';
        scrollWrapper.style.display = 'flex';
        scrollWrapper.style.overflow = 'auto'; 
        scrollWrapper.style.minHeight = '0'; // Crucial for flex child scrolling
        scrollWrapper.style.width = '100%';
        this.container.appendChild(scrollWrapper);

        // Gutter & Content go inside Wrapper
        this.gutter = document.createElement('div');
        this.gutter.className = 'json-viewer-gutter';
        scrollWrapper.appendChild(this.gutter);

        this.content = document.createElement('div');
        this.content.className = 'json-viewer-content';
        scrollWrapper.appendChild(this.content);
        
        const input = this.searchPanel.querySelector('input');
        const btnPrev = this.searchPanel.querySelector('.prev');
        const btnNext = this.searchPanel.querySelector('.next');
        const btnClose = this.searchPanel.querySelector('.close');

        input.addEventListener('input', () => this.performSearch(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) this.prevMatch();
                else this.nextMatch();
            }
        });
        btnPrev.addEventListener('click', () => this.prevMatch());
        btnNext.addEventListener('click', () => this.nextMatch());
        btnClose.addEventListener('click', () => {
            this.toggleSearch(false);
        });
        
        // Ensure hidden by default (fix specificity issues)
        this.searchPanel.style.display = 'none';
    }

    render() {
        this.content.innerHTML = '';
        this.gutter.innerHTML = '';
        this.lines = [];
        this.bracketStack = [];
        
        // Recursive build
        this._processValue(null, this.data, 0, [], true);

        // Render lines to DOM
        this.lines.forEach((line, index) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'json-line';
            lineEl.dataset.lineIndex = index;
            lineEl.innerHTML = line.html;
            
            // Indentation
            lineEl.style.paddingLeft = ((line.depth * 20) + 5) + 'px'; // +5 padding for text
            
            if (line.depth > 0) {
                 const bgSize = line.depth * 20;
                 // Gradient: line at 5px (match text padding of 5px).
                 // Text starts at 5px. Line should start at 5px.
                 lineEl.style.backgroundImage = `repeating-linear-gradient(to right, 
                    transparent 0px, 
                    transparent 5px, 
                    rgba(0,0,0,0.2) 5px, 
                    rgba(0,0,0,0.2) 6px, 
                    transparent 6px, 
                    transparent 20px
                 )`;
                 lineEl.style.backgroundSize = `${bgSize}px 100%`;
                 lineEl.style.backgroundRepeat = 'no-repeat';
            }
            
            // Highlight handlers
            lineEl.addEventListener('click', (e) => {
                this.handleLineClick(index);
                e.stopPropagation();
            });

            // Gutter Number Container
            const gutterNum = document.createElement('div');
            gutterNum.className = 'json-line-number';
            
            // Flex Layout: [Number][Expander] aligned to right

            // Number Text
            const numSpan = document.createElement('span');
            numSpan.textContent = String(index + 1);
            numSpan.className = 'json-line-num-text';
            gutterNum.appendChild(numSpan);

            // Expander Placeholder
            const expanderSpan = document.createElement('span');
            expanderSpan.className = 'json-expander-placeholder';
            
            if (line.collapsible) {
                 const expander = document.createElement('span');
                 expander.className = 'json-expander expanded'; // Default expanded
                 // Use SVG for Monaco-like chevron (chevron-down)
                 expander.innerHTML = `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z"/></svg>`;
                 
                 expander.addEventListener('click', (e) => {
                     e.stopPropagation();
                     this.toggleCollapse(index);
                 });
                 // Store ref
                 line.expanderElement = expander;
                 expanderSpan.appendChild(expander);
            }
            gutterNum.appendChild(expanderSpan);
            
            // Listener
            gutterNum.addEventListener('click', () => this.handleLineClick(index));

            this.gutter.appendChild(gutterNum);

            // Store references
            line.domElement = lineEl;
            line.gutterElement = gutterNum;
            this.content.appendChild(lineEl);
        });
    }

    _processValue(key, value, depth, path, isLast) {
        const isArray = Array.isArray(value);
        const isObject = value !== null && typeof value === 'object';
        
        let prefix = '';
        if (key !== null) {
            // Check if array item (key is index but we passed null for array items below?)
            // If key is present, it's an object property
            prefix = `<span class="json-key">"${key}"</span>: `;
        }
        
        if (isObject) {
            const isEmpty = isArray ? value.length === 0 : Object.keys(value).length === 0;
            const openChar = isArray ? '[' : '{';
            const closeChar = isArray ? ']' : '}';
            
            if (isEmpty) {
                // Determine if we should treat empty {} as having brackets to highlight?
                // Usually empty braces don't need matching highlighting because they are on the same line.
                // But if the user clicks it, we might want to highlight both characters.
                // Current implementation: One span with both chars.
                // Let's split them so we can highlight them if we want, OR just leave them.
                // CodeMirror/Monaco usually highlights matching bracket when cursor is near one.
                // Here we highlight on click of the line.
                // If I click the line with `{}`, maybe I want `{}` to highlight?
                // But `pairIndex` logic relies on two DIFFERENT lines.
                // If they are on the same line, `pairIndex` is null for that line.
                // So the current logic won't highlight anything for empty objects.
                // That seems acceptable as they are small and don't need matching help.
                
                let html = `${prefix}<span class="json-punctuation">${openChar}${closeChar}</span>`;
                if (!isLast) html += '<span class="json-punctuation">,</span>';
                this.addLine(depth, html);
            } else {
                // Opening line
                // "key": { 
                let openHtml = `${prefix}<span class="json-punctuation json-bracket">${openChar}</span>`;
                
                const openLineIndex = this.lines.length;
                this.addLine(depth, openHtml, true, 'open');

                // Children
                const keys = Object.keys(value);
                keys.forEach((k, i) => {
                    const childValue = value[k];
                    const childIsLast = i === keys.length - 1;
                    const nextPath = [...path, k];
                    
                    // If parent is array, we don't show keys
                    const childKey = isArray ? null : k;
                    this._processValue(childKey, childValue, depth + 1, nextPath, childIsLast);
                });

                // Closing line
                let closeHtml = `<span class="json-punctuation json-bracket">${closeChar}</span>`;
                if (!isLast) closeHtml += '<span class="json-punctuation">,</span>';
                const closeLineIndex = this.lines.length; 
                this.addLine(depth, closeHtml, false, 'close');
                
                // Link opening and closing brackets
                this.lines[openLineIndex].pairIndex = closeLineIndex;
                this.lines[closeLineIndex].pairIndex = openLineIndex;
            }
        } else {
            // Primitive
            let lineHtml = prefix + this._formatPrimitive(value);
            if (!isLast) lineHtml += '<span class="json-punctuation">,</span>';
            this.addLine(depth, lineHtml);
        }
    }

    addLine(depth, html, collapsible = false, type = null) {
        this.lines.push({
            html,
            depth,
            collapsible,
            type, // 'open' or 'close'
            visible: true,
            pairIndex: null
        });
    }

    _formatPrimitive(value) {
        if (typeof value === 'string') {
            const urlRegex = /(https?:\/\/[^\s"]+)/g;
            const escaped = value
                .replace(/&/g, '&amp;') // Escape & first
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
             
            // Detect links
            const formatted = escaped.replace(urlRegex, '<a class="json-link" href="$1" target="_blank">$1</a>');
            return `<span class="json-string">"${formatted}"</span>`;
        }
        if (typeof value === 'number') {
            return `<span class="json-number">${value}</span>`;
        }
        if (typeof value === 'boolean') {
            return `<span class="json-boolean">${value}</span>`;
        }
        if (value === null) {
            return `<span class="json-null">null</span>`;
        }
        return String(value);
    }
    
    handleLineClick(index) {
        // Remove highlight
        this.content.querySelectorAll('.json-line.highlight').forEach(el => el.classList.remove('highlight'));
        this.lines[index].domElement.classList.add('highlight');
        
        // Remove brace match
        this.content.querySelectorAll('.brace-match').forEach(el => el.classList.remove('brace-match'));
        
        // Check for brace match
        const line = this.lines[index];
        if (line.pairIndex !== null) {
            line.domElement.classList.add('brace-match');
            this.lines[line.pairIndex].domElement.classList.add('brace-match');
        }
    }

    toggleCollapse(index) {
        const line = this.lines[index];
        if (!line.collapsible || line.type !== 'open') return;
        
        const endIndex = line.pairIndex;
        if (endIndex === null) return; 

        const isCollapsed = line.domElement.classList.contains('collapsed');
        
        if (isCollapsed) {
            // EXPAND
            line.domElement.classList.remove('collapsed');
            if (line.expanderElement) {
                line.expanderElement.classList.add('expanded');
                line.expanderElement.classList.remove('collapsed');
            }
            // Unhide children logic
            for (let i = index + 1; i <= endIndex; i++) {
                const childLine = this.lines[i];
                childLine.domElement.classList.remove('hidden');
                childLine.gutterElement.classList.remove('hidden');

                // If child is a COLLAPSED block, skip its contents
                if (childLine.collapsible && childLine.type === 'open' && childLine.domElement.classList.contains('collapsed')) {
                     if (childLine.pairIndex !== null) {
                         i = childLine.pairIndex; // Skip to end of block
                     }
                }
            }
        } else {
            // COLLAPSE
            line.domElement.classList.add('collapsed');
            if (line.expanderElement) {
                line.expanderElement.classList.add('collapsed');
                line.expanderElement.classList.remove('expanded');
            }
            // Hide everything in between
            for (let i = index + 1; i <= endIndex; i++) {
                this.lines[i].domElement.classList.add('hidden');
                this.lines[i].gutterElement.classList.add('hidden');
            }
        }
    }

    // SEARCH
    toggleSearch(forceState) {
        if (forceState !== undefined) {
             if (forceState) {
                 this.searchPanel.style.display = 'flex';
                 this.searchPanel.classList.remove('hidden');
                 const input = this.searchPanel.querySelector('input');
                 input.focus();
                 if (input.value) {
                     input.select();
                     this.performSearch(input.value);
                 }
             } else {
                 this.searchPanel.style.display = 'none';
                 this.searchPanel.classList.add('hidden');
                 this.clearSearch();
                 this.searchPanel.querySelector('input').value = ''; 
                 this.updateSearchUI();
             }
        } else {
            const isHidden = this.searchPanel.style.display === 'none';
            if (isHidden) {
                // OPENING
                this.searchPanel.style.display = 'flex';
                this.searchPanel.classList.remove('hidden');
                const input = this.searchPanel.querySelector('input');
                input.focus();
                
                if (input.value) {
                    input.select();
                    this.performSearch(input.value);
                }
            } else {
                // CLOSING
                this.searchPanel.style.display = 'none';
                this.searchPanel.classList.add('hidden');
                // CLEANUP VISUALS AND INPUT
                this.clearSearch(); // Clears highlights
                // User requirement: "you see the previous term on ui" -> implied they DON'T want to see it?
                // "a bug that if you searched ... and then closed ... you see the previous term"
                // Yes, standard behavior is usually to keep history, but clean session is also valid.
                // Let's clear the input value on close based on "bug" description.
                this.searchPanel.querySelector('input').value = '';
                this.updateSearchUI(); // Reset count text
            }
        }
    }

    performSearch(query) {
        this.clearSearch();
        if (!query) return;
        
        // Case insensitive regex
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); 
        
        // Collect text nodes to highlight
        const nodes = [];
        // Helper to find text nodes in safe elements
        const walk = (el) => {
             // We only look inside specific classes to avoid messing up structural spans
             if (el.classList.contains('json-key') || el.classList.contains('json-string') || el.classList.contains('json-number') || el.classList.contains('json-boolean') || el.classList.contains('json-null')) {
                 if (el.children.length > 0) {
                     // e.g. json-string with links
                     Array.from(el.childNodes).forEach(child => {
                         if (child.nodeType === 3) {
                             if (child.textContent.trim()) nodes.push(child);
                         } else if (child.tagName === 'A') {
                             nodes.push(child); // We highlight inside the A tag element
                         } 
                     });
                 } else {
                     nodes.push(el); // We highlight the span element
                 }
             }
        }; 

        // Scan and populate
        const candidates = this.content.querySelectorAll('.json-key, .json-string, .json-number, .json-boolean, .json-null');
        candidates.forEach(el => {
             if (el.children.length === 0) {
                 this._highlightInElement(el, regex);
             } else {
                 Array.from(el.childNodes).forEach(node => {
                     // Node is either text node or <a> tag
                     if (node.nodeType === 1 && node.tagName === 'A') { // <a>
                         this._highlightInElement(node, regex);
                     } else if (node.nodeType === 3) { // Text
                         // Wrap text in span to be highlightable
                         if (!node.textContent.trim()) return;
                         const span = document.createElement('span');
                         span.textContent = node.textContent;
                         el.replaceChild(span, node);
                         this._highlightInElement(span, regex);
                     }
                 });
             }
        });
        
        this.updateSearchUI();
    }
    
    _highlightInElement(el, regex) {
        const text = el.textContent;
        if (!regex.test(text)) return;
        
        // This regex re-construction logic handles finding all matches
        const newHtml = text.replace(regex, (match) => `<span class="json-search-match">${match}</span>`);
        el.innerHTML = newHtml;
        
        const matches = el.querySelectorAll('.json-search-match');
        matches.forEach(m => this.searchMatches.push(m));
    }

    clearSearch() {
        const matches = this.content.querySelectorAll('.json-search-match');
        matches.forEach(span => {
            const parent = span.parentNode;
            parent.replaceChild(document.createTextNode(span.textContent), span);
            parent.normalize();
        });
        this.searchMatches = [];
        this.currentMatchIndex = -1;
        this.updateSearchUI();
    }

    nextMatch() {
        if (!this.searchMatches.length) return;
        if (this.currentMatchIndex >= 0) {
            this.searchMatches[this.currentMatchIndex].classList.remove('active');
        }
        this.currentMatchIndex = (this.currentMatchIndex + 1) % this.searchMatches.length;
        this._activateMatch();
    }

    prevMatch() {
        if (!this.searchMatches.length) return;
        if (this.currentMatchIndex >= 0) {
            this.searchMatches[this.currentMatchIndex].classList.remove('active');
        }
        this.currentMatchIndex = (this.currentMatchIndex - 1 + this.searchMatches.length) % this.searchMatches.length;
        this._activateMatch();
    }

    _activateMatch() {
        const match = this.searchMatches[this.currentMatchIndex];
        match.classList.add('active');
        match.scrollIntoView({ block: 'center', behavior: 'smooth' });
        this.updateSearchUI();
        
        // Auto-expand parents if hidden
        let parentLine = match.closest('.json-line');
        if (parentLine && parentLine.classList.contains('hidden')) {
            // Traverse upwards logic needed? 
            // For now, assume user expands. 
            // Or implement "Reveal" logic later.
            // Simplified "Reveal":
            // Find index. Look back for collapsed. Uncollapse.
             const index = parseInt(parentLine.dataset.lineIndex);
             let currDepth = this.lines[index].depth;
             
             // Backtrack
             for(let i = index - 1; i >= 0; i--) {
                 const l = this.lines[i];
                 if (l.depth < currDepth && l.collapsible) {
                     if (l.domElement.classList.contains('collapsed')) {
                         this.toggleCollapse(i);
                     }
                     currDepth = l.depth;
                 }
             }
        }
    }

    updateSearchUI() {
        const count = this.searchPanel.querySelector('.search-count');
        if (this.searchMatches.length === 0) {
            count.textContent = 'No results';
        } else {
            count.textContent = `${this.currentMatchIndex + 1} of ${this.searchMatches.length}`;
        }
    }
    
    initEvents() {
        // Keyboard shortcuts
        this.container.addEventListener('keydown', (e) => {
             // Handle Ctrl+F for search
             if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                e.stopPropagation();
                // If search is already open and input has focus, maybe close? 
                // Or if just open, focus input.
                this.toggleSearch(true);
            }
            // Close on Escape
            if (e.key === 'Escape') {
                this.toggleSearch(false);
                this.container.focus(); // Return focus to container
            }

            // Prevent Browser Back on Backspace (unless inside input)
            if (e.key === 'Backspace') {
                const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
                if (!isInput) {
                    e.preventDefault();
                }
            }
        });
    }
}

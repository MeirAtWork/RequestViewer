import { Decoration, ViewPlugin, WidgetType } from "@codemirror/view";

export function setupLinkDecorator(RangeSetBuilder) {
  // Regular expression to match URLs
  const urlRegex = /https?:\/\/[^\s"'<>]+/g;

  // Widget to render clickable links
  class LinkWidget extends WidgetType {
    constructor(url) {
      super();
      this.url = url;
    }

    toDOM() {
      let link = document.createElement("a");
      link.href = this.url;
      link.textContent = this.url;
      link.target = "_blank";
      link.style.color = "blue";
      link.style.textDecoration = "underline";
      return link;
    }
  }

  // Plugin to apply decorations
  const linkDecorator = ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = this.getDecorations(view);
      }

      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.getDecorations(update.view);
        }
      }

      getDecorations(view) {
        let builder = new RangeSetBuilder();
        for (let { from, to } of view.visibleRanges) {
          let text = view.state.doc.sliceString(from, to);
          let match;
          while ((match = urlRegex.exec(text)) !== null) {
            let start = from + match.index;
            let end = start + match[0].length;
            builder.add(start, end, Decoration.replace({ widget: new LinkWidget(match[0]) }));
          }
        }
        return builder.finish();
      }
    },
    {
      decorations: (v) => v.decorations
    }
  );

  return linkDecorator;
}
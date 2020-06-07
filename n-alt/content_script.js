baseline = [
  "img"
];

const load = () => {
  viewer = document.querySelector("#aom-viewer") || document.createElement("div");
  viewer.height = document.body.clientHeight;
  viewer.width = document.body.clientWidth;
  viewer.style.display = "inline-block";
  viewer.id = "aom-viewer";
  viewer.setAttribute("aria-hidden", true);

  document.body.appendChild(viewer);

  document.addEventListener("keypress", (e) => {
    if (e.keyCode === 27) {
      viewer.innerHTML = null;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.keyCode === 17) {
      viewer.style.display = "none";
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.keyCode === 17) {
      viewer.style.display = "inline-block";
    }
  });

  const observer = new MutationObserver(async (mutations, observer) => {
    let images = [];

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === "IMG" || (node.style && node.style.backgroundImage)) {
          images.push(node);
        }
      });

      mutation.removedNodes.forEach(node => {
        try {
          let removed = [];
          let url = "";

          if (node.nodeName === "IMG") {
            removed.push(node);
          } else if (node.childNodes.length > 0) {
            removed = node.querySelectorAll("img");
          }

          removed.forEach(node => {
            let overlay = null;

            if (node.src) {
              url = new URL(node.src);
              overlay = document.querySelector(`[data-nalt-source*='${url.pathname}']`);
            }

            if (overlay) {
              overlay.remove();
            }
          });

          // TODO: check background images
          // if (node.style && node.style.backgroundImage) {
          //   url = new URL(node.style.backgroundImage.replace("url(", "").replace("\"", ""));
          //   document.querySelector(`[data-nalt-source*='${url.pathname}']`).remove();
          // }
        } catch (error) {
          // TODO: create error object
          console.warn("whoops, n'alt text failed.", error);
        };
      });

      if (mutation.attributeName === "src" && node.target.nodeName === "IMG") {
        naltify(mutation.target, mutation.target.getAttribute("alt"))
      }

      if (mutation.attributeName === "style") {
        // TODO: check if became hidden and remove overlay
      }
    });

    images.forEach(el => naltify(el, el.getAttribute("alt")));
  });

  var config = { attributes: true, childList: true, subtree: true, characterData: false };

  observer.observe(document.body, config);

  naltify = async (el, alt = null) => {
    try {
      if (el.ariaLabel !== null) {
        alt = el.ariaLabel;
      }

      if (alt.length > 0 && (alt.toLowerCase() === "embedded video" ||
        alt.toLowerCase().startsWith("no alt") ||
        alt.toLowerCase() === "image")) {
        alt = "";
      }

      let accessibility = { name: alt }

      const rect = el.getBoundingClientRect();
      const overlay = document.createElement("span");

      viewer.appendChild(overlay);

      if (el.src) {
        let url = new URL(el.src);
        overlay.dataset.naltSource = url.origin + url.pathname;
      }

      overlay.style.position = "absolute";
      overlay.style.left = window.scrollX + rect.left + "px";
      overlay.style.top = window.scrollY + rect.top + "px";
      overlay.style.height = rect.height + "px";
      overlay.style.width = rect.width + "px";
      overlay.style.zIndex = 9999;
      overlay.style.backgroundColor = "transparent";

      if (accessibility.name !== null && accessibility.name.trim() === "") {
        // TODO: create SVG once.
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

        if (el.style.backgroundImage) {
          url = new URL(el.style.backgroundImage.replace("url(", "").replace("\"", ""));
          overlay.dataset.naltSource = `${url.origin}${url.pathname}`;
        }

        overlay.title = "decorative image... orly?"
        el.title = "decorative image... orly?"
        svg.appendChild(text);
        overlay.appendChild(svg);

        svg.style.width = "100%";
        svg.viewBox.baseVal.width = 17;
        svg.viewBox.baseVal.height = 21;
        text.setAttributeNS(null, "x", 2);
        text.setAttributeNS(null, "y", 13);
        text.textContent = "💩";
      } else if (accessibility.name === null) {
        overlay.title = "wtf no alt text!"
        el.title = "wtf no alt text!"

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        svg.appendChild(text);
        overlay.appendChild(svg);

        svg.style.width = "100%";
        svg.viewBox.baseVal.width = 17;
        svg.viewBox.baseVal.height = 21;
        text.setAttributeNS(null, "x", 2);
        text.setAttributeNS(null, "y", 13);
        text.textContent = "🖕";
      } else {
        el.classList.add("aom-viewer-labelled")
        overlay.title = accessibility.name;
      }
    } catch (error) {
      console.warn("failed to n'altify: ", error);
    }
  }

  els = document.querySelectorAll(baseline.join(", "));
  els.forEach(el => naltify(el, el.getAttribute("alt")));
}

try {
  load();
} catch (error) {
  console.warn("n'altify general error: ", error);
}

// TODO: check background images.

// reject = [
//   "script",
//   "iframe",
//   "style"
// ]

// skip = [...baseline]

// filter = {
//   acceptNode: (node) => {
//     const tag = node.tagName.toLowerCase();
//     if (reject.includes(tag) ||
//       node.id === "aom-viewer" ||
//       node.className === "aom-viewer"
//     ) {
//       return NodeFilter.FILTER_REJECT;
//     } else if (skip.includes(tag) ||
//       (tag === "div" && tag.role === null)
//     ) {
//       return NodeFilter.FILTER_SKIP;
//     } else {
//       return NodeFilter.FILTER_ACCEPT;
//     }
//   }
// };

// treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, filter);

// run = async () => {
//   while (node = treeWalker.nextNode()) {
//     if (node.style.backgroundImage) {
//       naltify(node, "");
//     }
//   }
// }

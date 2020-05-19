baseline = [
  "img"
];

reject = [
  "script",
  "iframe",
  "style"
]

els = document.querySelectorAll(baseline.join(", "));

viewer = document.querySelector("#aom-viewer") || document.createElement("div");
viewer.height = document.body.clientHeight;
viewer.width = document.body.clientWidth;
viewer.style.display = "inline-block";
viewer.id = "aom-viewer";

document.body.appendChild(viewer);

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

els.forEach(async el => {
  let accessibility = { name: el.alt }

  try {
    accessibility = await window.getComputedAccessibleNode(el);
  } catch {
    console.log("enable full n'alt text features here: chrome://flags/#enable-experimental-web-platform-features");
  }

  const rect = el.getBoundingClientRect();
  const overlay = document.createElement("span");

  el.classList.add("aom-viewer-seen");
  viewer.appendChild(overlay);
  overlay.className = "aom-viewer";
  overlay.style.position = "absolute";
  overlay.style.left = window.scrollX + rect.left + "px";
  overlay.style.top = window.scrollY + rect.top + "px";
  overlay.style.height = rect.height + "px";
  overlay.style.width = rect.width + "px";
  overlay.style.zIndex = 9999;
  overlay.style.backgroundColor = "#fff";

  if (accessibility.name === null ||
    accessibility.name.trim() === "" ||
    accessibility.name.toLowerCase() === "image") {

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
    overlay.innerText = accessibility.name;
    overlay.title = accessibility.name;
  }
})

skip = [...baseline]

filter = {
  acceptNode: (node) => {
    const tag = node.tagName.toLowerCase();
    if (reject.includes(tag) ||
      node.id === "aom-viewer" ||
      node.className === "aom-viewer" ||
      node.classList.contains("aom-viewer-labelled") ||
      node.classList.contains("aom-viewer-seen")
    ) {
      return NodeFilter.FILTER_REJECT;
    } else if (skip.includes(tag) ||
      (tag === "div" && tag.role === null)
    ) {
      return NodeFilter.FILTER_SKIP;
    } else {
      return NodeFilter.FILTER_ACCEPT;
    }
  }
};

treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, filter);

paused = false;

run = async () => {
  while (!paused && (node = treeWalker.nextNode())) {
    node.classList.add("aom-viewer-seen");

    const rect = node.getBoundingClientRect();
    const accessibility = await window.getComputedAccessibleNode(node);
    const overlay = document.createElement("span");

    overlay.className = "aom-viewer";
    overlay.style.position = "absolute";
    overlay.style.display = "flex"
    overlay.style.justifyContent = "center";
    overlay.style.left = window.scrollX + rect.left + "px";
    overlay.style.top = window.scrollY + rect.top + "px";
    overlay.style.height = rect.height + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.color = "rgba(0,0,0,1)";
    overlay.style.zIndex = 9999;
    overlay.style.overflow = "hidden";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    svg.appendChild(text);
    overlay.appendChild(svg);

    svg.style.width = "100%";
    svg.viewBox.baseVal.width = 17;
    svg.viewBox.baseVal.height = 21;
    text.setAttributeNS(null, "x", 2);
    text.setAttributeNS(null, "y", 13);
    text.textContent = accessibility.name;
  }
};

run();
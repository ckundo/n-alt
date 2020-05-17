viewer = document.querySelector("#aom-viewer") || document.createElement("div");
viewer.height = document.body.clientHeight;
viewer.width = document.body.clientWidth;
viewer.style.display = "none";
viewer.id = "aom-viewer";

images = document.querySelectorAll("img");

images.forEach(async image => {
  const accessibility = await window.getComputedAccessibleNode(image);
  const rect = image.getBoundingClientRect();
  const overlay = document.createElement("span");

  image.classList.add("aom-viewer-seen");
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
    overlay.innerText = accessibility.name;
    overlay.title = accessibility.name;
    overlay.style.fontSize = "2rem";
  }
})

filter = {
  acceptNode: (node) => {
    const tag = node.tagName.toLowerCase();
    if (tag === "iframe" ||
      tag === "img" ||
      tag === "noscript" ||
      tag === "script" ||
      tag === "path" ||
      tag === "g" ||
      tag === "polygon" ||
      node.id === "aom-viewer" ||
      node.className === "aom-viewer" ||
      node.classList.contains("aom-viewer-seen")
    ) {
      return NodeFilter.FILTER_SKIP;
    } else {
      return NodeFilter.FILTER_ACCEPT;
    }
  }
};

document.body.appendChild(viewer);

document.addEventListener("keydown", (e) => {
  if (e.keyCode === 17) {
    viewer.style.display = "inline-block";
  }
});

document.addEventListener("keyup", (e) => {
  if (e.keyCode === 17) {
    viewer.style.display = "none";
  }
});

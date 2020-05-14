images = document.querySelectorAll("img");
inputs = document.querySelectorAll("input, button, textarea");

images.forEach(async image => {
  const accessibility = await window.getComputedAccessibleNode(image);
  const rect = image.getBoundingClientRect();
  const overlay = document.createElement("p");

  overlay.style.visibility = "hidden";
  overlay.style.position = "absolute";
  overlay.style.left = rect.left + "px";
  overlay.style.top = rect.top + "px";
  overlay.style.height = rect.height + "px";
  overlay.style.width = rect.width + "px";
  overlay.style.lineHeight = "5rem";
  overlay.style.backgroundColor = "rgba(255,255,255,0.9)";
  overlay.style.color = "rgba(0,0,0,1)";
  overlay.style.zIndex = 9999;
  overlay.style.overflow = "hidden";
  document.body.appendChild(overlay);

  if (accessibility.name === null || accessibility.name.trim() === "") {
    overlay.innerText = "🖕";
    overlay.style.fontSize = "4rem";
    overlay.style.visibility = "visible";
  }
})

const htmlBtn = document.querySelector("#html");
const cssBtn = document.querySelector("#css");
const jsBtn = document.querySelector("#js");
const runBtn = document.querySelector("#run");
const handBurger = document.querySelector("#handburger");
const containerDiv = document.querySelector("#editor-buttons");

const htmlTextArea = document.querySelector("#htmlTextArea");
const cssTextArea = document.querySelector("#cssTextArea");
const jsTextArea = document.querySelector("#jsTextArea");
const iframe = document.querySelector("#result");

htmlTextArea.value = "<h1>Hello World</h1>";
cssTextArea.value = "h1 { color: red; text-align: center; }";
jsTextArea.value = "console.log('Hello from JS');";

let isOpen = false;

const hamburgerSVG = `
  <svg class="hamburger" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20 H90" stroke="white" stroke-width="10" stroke-linecap="round"/>
    <path d="M10 40 H90" stroke="white" stroke-width="10" stroke-linecap="round"/>
    <path d="M10 60 H90" stroke="white" stroke-width="10" stroke-linecap="round"/>
  </svg>
`;

const closeSVG = `
  <svg class="hamburger" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="20" x2="80" y2="80" stroke="red" stroke-width="10" stroke-linecap="round"/>
    <line x1="80" y1="20" x2="20" y2="80" stroke="red" stroke-width="10" stroke-linecap="round"/>
  </svg>
`;

handBurger.innerHTML = hamburgerSVG;

handBurger.addEventListener("click", () => {
  containerDiv.classList.toggle("show");
  isOpen = !isOpen;
  handBurger.innerHTML = isOpen ? closeSVG : hamburgerSVG;
});

const htmlTags = [
  "a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","blockquote","body","br","button","canvas","caption",
  "cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset",
  "figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hr","html","i","iframe","img","input","ins",
  "kbd","label","legend","li","link","main","map","mark","meta","meter","nav","noscript","object","ol","optgroup","option","output",
  "p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span",
  "strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr",
  "track","u","ul","var","video","wbr"
];

const dropdown = document.createElement("div");
Object.assign(dropdown.style, {
  position: "absolute",
  background: "white",
  border: "1px solid gray",
  fontFamily: "monospace",
  fontSize: "14px",
  zIndex: 1000,
  display: "none",
  maxHeight: "150px",
  overflowY: "auto",
  padding: "5px",
  color: "black"
});
document.body.appendChild(dropdown);

let currentSuggestions = [];
let selectedIndex = -1;

htmlTextArea.addEventListener("input", (e) => {
  const cursorPos = e.target.selectionStart;
  const textBeforeCursor = e.target.value.slice(0, cursorPos);
  const match = textBeforeCursor.match(/<(\w*)$/);
  if (match) {
    const fragment = match[1];
    const filtered = htmlTags.filter(tag => tag.startsWith(fragment));
    if (filtered.length) {
      showDropdown(filtered);
      positionDropdown(htmlTextArea, cursorPos);
      htmlTextArea.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      dropdown.style.display = "none";
    }
  } else {
    dropdown.style.display = "none";
  }
});

htmlTextArea.addEventListener("keydown", (e) => {
  if (dropdown.style.display === "none") return;

  if (e.key === "ArrowDown") {
    selectedIndex = (selectedIndex + 1) % currentSuggestions.length;
    updateActiveSuggestion();
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    selectedIndex = (selectedIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
    updateActiveSuggestion();
    e.preventDefault();
  } else if (e.key === "Enter" && selectedIndex !== -1) {
    insertTag(`${currentSuggestions[selectedIndex]}></${currentSuggestions[selectedIndex]}>`);
    e.preventDefault();
  } else if (e.key === "Escape") {
    dropdown.style.display = "none";
  }
});

function insertTag(tag) {
  const pos = htmlTextArea.selectionStart;
  const value = htmlTextArea.value;
  const before = value.slice(0, pos).replace(/<\w*$/, `<${tag}`);
  const after = value.slice(pos);
  htmlTextArea.value = before + after;
  htmlTextArea.focus();
  htmlTextArea.selectionStart = htmlTextArea.selectionEnd = before.length;
  dropdown.style.display = "none";
}

function showDropdown(suggestions) {
  dropdown.innerHTML = "";
  currentSuggestions = suggestions;
  selectedIndex = -1;

  suggestions.forEach((tag, idx) => {
    const item = document.createElement("div");
    item.textContent = tag;
    item.style.padding = "2px 6px";
    item.style.cursor = "pointer";

   
    item.addEventListener("click", () => {
      insertTag(`${tag}></${tag}>`);
    });

    item.addEventListener("mouseover", () => {
      selectedIndex = idx;
      updateActiveSuggestion();
    });

    dropdown.appendChild(item);
  });

  dropdown.style.display = "block";
}

function updateActiveSuggestion() {
  Array.from(dropdown.children).forEach((child, idx) => {
    child.style.background = idx === selectedIndex ? "#ddd" : "white";
  });
}

function positionDropdown(textarea, position) {
  const div = document.createElement("div");
  const style = getComputedStyle(textarea);
  for (const prop of style) {
    div.style[prop] = style[prop];
  }
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";
  div.style.width = textarea.offsetWidth + "px";
  const text = textarea.value.slice(0, position);
  const span = document.createElement("span");
  span.textContent = "\u200b";
  div.textContent = text;
  div.appendChild(span);
  document.body.appendChild(div);
  const rect = span.getBoundingClientRect();
  const taRect = textarea.getBoundingClientRect();
  dropdown.style.left = taRect.left + rect.left - div.getBoundingClientRect().left + "px";
  dropdown.style.top = taRect.top + rect.top - div.getBoundingClientRect().top + 20 + "px";
  document.body.removeChild(div);
}

function showEditor(activeTextArea) {
  [htmlTextArea, cssTextArea, jsTextArea].forEach((ta) => {
    ta.classList.remove("active");
  });
  activeTextArea.classList.add("active");
}

htmlBtn.addEventListener("click", () => showEditor(htmlTextArea));
cssBtn.addEventListener("click", () => showEditor(cssTextArea));
jsBtn.addEventListener("click", () => showEditor(jsTextArea));

runBtn.addEventListener("click", () => {
  const htmlVal = htmlTextArea.value;
  const cssVal = cssTextArea.value;
  const jsVal = jsTextArea.value;
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  const fullDoc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>${cssVal}</style>
    </head>
    <body>
      ${htmlVal}
      <script>
        (function(){
          ${jsVal}
        })();
      <\/script>
    </body>
    </html>
  `;
  doc.open();
  doc.write(fullDoc);
  doc.close();
});

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    runBtn.click();
  }
});
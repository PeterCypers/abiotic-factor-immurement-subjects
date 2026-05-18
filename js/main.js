let IS = [];
let filtered = [];
const FILTER_INPUT = document.getElementById("is-filter");
const CARD_CONTAINER = document.getElementById("cards-container");
const REDACTED_IMG_PATH = "img/imageRedacted.webp";
const MISSING_IMG_PATH = "img/image_missing_badge_square.svg";
const RESETBTN = document.getElementById("resetfilterbtn");
const INFOPAGEBTN = document.getElementById("infoPageBtn");
const LOCALSTORAGE = localStorage;

// filter the original list(IS) and store the filtered data in 'filtered'
function filterData(filtervalue) {
  if (!filtervalue) {
    filtered = IS;
    return;
  }
  // case-insensitive
  filtered = IS.filter((subject) => 
    subject["subject-id"].toLowerCase().includes(filtervalue.toLowerCase()) ||
    subject.name.toLowerCase().includes(filtervalue.toLowerCase()));
}

/**
 * after fetching data show all images
 * happens whenever the page is refreshed
 */
async function fetchIsData() {
  const response = await fetch('data/is-data.json');
  IS = await response.json();

  if(FILTER_INPUT == ""){
    showAllImages();
  } else {
    // feature: checking IS-info-page and returning to active filter
    filterData(FILTER_INPUT.value);
    toHTML();
  }
}

/**
 * helper function, card structure is defined here
 * 
 * @param {Object} subject: Immurement Subject (json)
 * @returns {HTMLDivElement} card
 */
function makeCardElement(subject) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.id = `card${subject.id}`;

  // set color based on Echelon
  // echelon split into parts, example: Crucis (AG/IN) -> Crucis + (AG/IN)
  const [echelonStart, echelonEnd] = subject["containment-echelon"].split(" ");

  let color = "";
  switch (echelonStart) {
    case "Jura":  color = "t-gray";
      break;
    case "Solutus": color = "t-purple";
      break;
    case "Thela": color = "t-red";
      break;
    case "Crucis": color = "t-yellow";
      break;
    case "Sanc": color = "t-blue";
      break;
    case "Ordo": color = "t-green";
      break;
    default: color = "";
  }

  card.insertAdjacentHTML("beforeend", `<h3 id="${subject.id}" class="card-title">${subject["subject-id"]}</h3>`);
  card.insertAdjacentHTML("beforeend", `<img src="${subject.imgPath.includes("redact")? REDACTED_IMG_PATH: subject.imgPath? subject.imgPath: MISSING_IMG_PATH}" alt="image of ${subject["subject-id"]}">`);
  card.insertAdjacentHTML("beforeend", `<h3 id="${subject.name}" class="card-name">${subject.name}</h3>`);
  card.insertAdjacentHTML("beforeend",
    `<div x-data="{ open: false }">
        Description
      <button @click="open = ! open" class="arrowbtn">
        <i class="fa-solid" :class="open ? 'fa-angle-up' : 'fa-angle-down'"></i>
      </button>
      <div x-show="open" @click.outside="open = false" class="card-description">${subject.description}</div>
    </div>`);
  card.insertAdjacentHTML("beforeend",
    `<div x-data="{ open: false }" class="mt-2">
        Extra Info
      <button @click="open = ! open" class="arrowbtn">
        <i class="fa-solid" :class="open ? 'fa-angle-up' : 'fa-angle-down'"></i>
      </button>
      <div x-show="open" @click.outside="open = false" class="card-description">
        <strong>Classification:</strong> ${subject.classification}<br>
        <strong>Containment Echelon:</strong> <span class="${color}">${echelonStart}</span> ${echelonEnd}<br>
      </div>
    </div>`);

  return card;
}

/**
 * called in fetchIsData()
 * after saving the json data to IS
 * shows all of the IS'
 */
function showAllImages() {
  console.log(IS);
  CARD_CONTAINER.innerHTML = ""; // reset

  IS.forEach((subject) => {
    const card = makeCardElement(subject); // construct each card
    CARD_CONTAINER.insertAdjacentElement("beforeend", card); // append inside flex-container
  });
}

// todo: forEach over the filtered list, sending each json obj to makeCardElement,
// beforeEnd appending the returned card inside the flex container
function toHTML() {
  CARD_CONTAINER.innerHTML = ""; // reset

  filtered.forEach((subject) => {
    const card = makeCardElement(subject); // construct each card
    CARD_CONTAINER.insertAdjacentElement("beforeend", card); // append inside flex-container
  });

}

// feature: checking IS-info-page and returning to active filter
function getFilterInput() {
  if(LOCALSTORAGE.getItem("immurementsubjectfilter")) {
    FILTER_INPUT.value = LOCALSTORAGE.getItem("immurementsubjectfilter")
  }
}
// feature: checking IS-info-page and returning to active filter
function setFilterInput(filterValue) {
  LOCALSTORAGE.setItem("immurementsubjectfilter", filterValue);
}

async function init() {
  getFilterInput();
  // get all the IS and store them
  await fetchIsData();
  // console.log(IS); // debug

  // this works because the list is short, but for longer lists other method should be considered:
  // only updating the view on pause of typing, instead of every keystroke when listsize n is sufficiently large
  FILTER_INPUT.addEventListener("keyup", function(e) {
    // close keyboard on mobile:
    if (e.key === "Enter"){
      FILTER_INPUT.blur();
    }
    setFilterInput(this.value);
    filterData(this.value);
    toHTML();
  });

  RESETBTN.onclick = () => {
    FILTER_INPUT.value = "";
    setFilterInput("");
    // FILTER_INPUT.focus(); // not fun 
    showAllImages();
  };

  INFOPAGEBTN.onclick = () => {
    navigation.navigate("/abiotic-factor-immurement-subjects/extraInfoPage"); // this is new since 2026 (not supported by all browsers yet...)
    // location.href = "/extraInfoPage.html"; // works on older browsers
  };
};

window.onload = init;

/**************************************************************************************/
/**
 * attempt at parsing the source data...
 * ended up using Claude to convert the source to json
 * 
 * [REDUNDANT]
 */
async function convertTextToJson(){
  // old school
  // await fetch('http://127.0.0.1:5500/data/scraped-data.txt')
  //   .then(response => response.text())
  //   .then((data) => {
  //     console.log(data)
  //   });

  // grab the text from the file
  const response = await fetch('http://127.0.0.1:5500/data/scraped-data.txt');
  const data = await response.text();

  const IS_MAP = new Map();
  //split into sentences
  const sentences = data.split("\n");
  sentences.forEach((sentence) => {
    const [main, description] = sentence.split("description: "); // a problem exists in that description contained ","'s
    const parts = main.split(",").map(e => e.trim());
    IS_MAP.set(parts[0].trim(), [...parts.slice(1), description.trim()]);
  });

  // transform Map to Object with keys in prep to transform into json
  let id = 1;
  const stripPrefix = (str) => str.includes(": ") ? str.split(": ").slice(1).join(": ") : str;

  const result = Array.from(IS_MAP.entries()).map(([key, values]) => ({
    "id": String(id++),
    "subject-id": key.replace("subject-id: ", "").trim(),
    "containment-echelon": stripPrefix(values[0]),
    "classification": stripPrefix(values[1]),
    "name": stripPrefix(values[2]),
    "description": values[3],
    "imgPath": ""
  }));

  // JSON.stringify(value, replacer, space)
  console.log(JSON.stringify(result, null, 2));
}
/**************************************************************************************/
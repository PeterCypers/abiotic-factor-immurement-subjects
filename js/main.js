let IS = [];

/**
 * attempt at parsing the source data...
 * ended up using Claude to convert the source to json
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

async function getIsData() {
  const response = await fetch('http://127.0.0.1:5500/data/is-data.json');
  const data = await response.json();
  return data;
}

async function init() {
  IS = await getIsData();
  console.log(IS);
};


window.onload = init;

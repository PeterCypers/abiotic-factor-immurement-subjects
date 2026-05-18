const HOMEPAGEBTN = document.getElementById("homePageBtn");

function init() {
  HOMEPAGEBTN.onclick = () => {
    navigation.navigate("/abiotic-factor-immurement-subjects/");
  }
};

window.onload = init;
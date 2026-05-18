const HOMEPAGEBTN = document.getElementById("homePageBtn");

function init() {
  HOMEPAGEBTN.onclick = () => {
    navigation.navigate("/");
  }
};

window.onload = init;
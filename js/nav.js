/**
 * Created by totor on 2017-09-10.
 */

// ***************** Laps Selection modal ******************** //
// get the modal
var lap_modal = document.getElementById("lapsModal");

// get the button that opens the modal
var lap_btn = document.getElementById("select_laps");

// get the <span> element that cloases the modal;
var lap_span = document.getElementsByClassName("lap_select.close");

// When the user clicks the button, open the modal
lap_btn.onclick = function () {
    lap_modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
lap_span.onclick = function () {
    lap_modal.style.display = "none";
}

// ***************** ABOUT modal ******************** //
// get the modal
var about_modal = document.getElementById("aboutModal");

// get the button that opens the modal
var about_btn = document.getElementById("about");

// get the <span> element that cloases the modal;
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
about_btn.onclick = function () {
    about_modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
$("span.close").click(function(){
    about_modal.style.display = "none";
    lap_modal.style.display = "none";
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if(event.target == lap_modal){
        lap_modal.style.display = "none";
    }else if(event.target == about_modal){
        about_modal.style.display = "none";
    }
}


function closeNavLeft() {
    document.getElementById("sideNavLeft").style.width = "0";

}

function closeNavRight() {
    document.getElementById("sideNavRight").style.width = "0";

}

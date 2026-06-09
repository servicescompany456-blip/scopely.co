/* ========================= */
/* MOBILE MENU */
/* ========================= */

const menuToggle =
document.getElementById("menuToggle");

const navMenu =
document.getElementById("navMenu");

if(menuToggle && navMenu){

menuToggle.addEventListener(
"click",
()=>{

navMenu.classList.toggle("active");

});

}

/* ========================= */
/* CONTACT SUPPORT FORM */
/* ========================= */

const contactForm =
document.getElementById("contactForm");

if(contactForm){

contactForm.addEventListener(
"submit",
async function(e){

e.preventDefault();

const submitBtn =
document.getElementById("submitBtn");

submitBtn.innerText =
"Sending...";

submitBtn.disabled = true;

const formData =
new FormData(contactForm);

try{

const response =
await fetch(
"https://formspree.io/f/mvznodea",
{
method:"POST",
body:formData,
headers:{
Accept:"application/json"
}
}
);

if(response.ok){

contactForm.reset();

window.location.href =
"success.html";

}else{

alert(
"Failed to send message. Please try again."
);

submitBtn.innerText =
"Send Message";

submitBtn.disabled = false;

}

}catch(error){

console.error(error);

alert(
"Network error. Please check your internet connection."
);

submitBtn.innerText =
"Send Message";

submitBtn.disabled = false;

}

});

}


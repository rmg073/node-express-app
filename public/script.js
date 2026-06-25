async function searchMedicine() {

const input = document
.getElementById("medicineSearch")
.value
.trim();

const results =
document.getElementById("searchResults");

if(input === ""){

results.innerHTML =
"<h2>Please enter a medicine name.</h2>";

return;

}

results.innerHTML =
"<h2>Searching...</h2>";

try{

const response =
await fetch("/api/search?name=" + encodeURIComponent(input));

const medicines =
await response.json();

if(medicines.length===0){

results.innerHTML =
"<h2>No medicines found.</h2>";

return;

}

results.innerHTML =
medicines.map(item => `

<div class="product-card">

<h2>${item.name}</h2>

<p>${item.category}</p>

<h3>₹${item.price}</h3>

<a
class="whatsapp-btn"
target="_blank"
href="https://wa.me/919837100364?text=I want to order ${encodeURIComponent(item.name)}">

Buy Now

</a>

</div>

`).join("");

}
catch(error){

console.error(error);

results.innerHTML =
"<h2>Server Error</h2>";

}

}

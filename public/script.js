// =========================================
// MOHAN HEALTH & HOME
// PROFESSIONAL SEARCH ENGINE V5
// PART 1
// =========================================

const searchBox = document.getElementById("medicineSearch");
const results = document.getElementById("searchResults");

let medicines = [];
let searchTimeout;

// ---------------------------
// Create Dropdown
// ---------------------------

const dropdown = document.createElement("div");
dropdown.className = "search-dropdown";
dropdown.id = "searchDropdown";

document.querySelector(".search-area").appendChild(dropdown);

// ---------------------------
// Load Medicines
// ---------------------------

async function loadMedicines() {

    try {

        const response = await fetch("/api/search?name=");

        medicines = await response.json();

        console.log("Medicines Loaded :", medicines.length);

    }

    catch (err) {

        console.error(err);

    }

}

// ---------------------------
// Live Search
// ---------------------------

searchBox.addEventListener("keyup", function () {

    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {

        liveSearch(this.value);

    }, 250);

});

// ---------------------------
// Live Search Function
// ---------------------------

function liveSearch(text) {

    const q = text.trim().toLowerCase();

    if (q.length < 2) {

        dropdown.style.display = "none";

        return;

    }

    const matches = medicines.filter(item =>

        (item.name || "").toLowerCase().includes(q)

    ).slice(0,10);
  // =========================================
// SHOW DROPDOWN
// =========================================

function showDropdown(list){

    if(list.length===0){

        dropdown.style.display="none";

        return;

    }

    dropdown.innerHTML=list.map(item=>`

<div class="search-item"

onclick="selectMedicine('${item.name.replace(/'/g,"\\'")}')">

<div>

<h4>${item.name}</h4>

<span>

${item.category || ""}

&nbsp;&nbsp;

${item.company || ""}

</span>

</div>

<div>

₹${item.price || ""}

</div>

</div>

`).join("");

    dropdown.style.display="block";

}

// =========================================
// CLICK MEDICINE
// =========================================

function selectMedicine(name){

    searchBox.value=name;

    dropdown.style.display="none";

    searchMedicine();

}

// =========================================
// HIDE DROPDOWN
// =========================================

document.addEventListener("click",(e)=>{

    if(!e.target.closest(".search-area")){

        dropdown.style.display="none";

    }

});
// =========================================
// SEARCH MEDICINE
// =========================================

async function searchMedicine() {

    const input = searchBox.value.trim();

    if (input === "") {

        results.innerHTML = `
        <div class="empty">
            Start typing a medicine name...
        </div>
        `;

        return;

    }

    results.innerHTML = `
    <div class="loading">
        Searching...
    </div>
    `;

    try {

        const response = await fetch(
            "/api/search?name=" + encodeURIComponent(input)
        );

        const data = await response.json();

        dropdown.style.display = "none";

        if (data.length === 0) {

            results.innerHTML = `
            <div class="empty">
                No medicines found.
            </div>
            `;

            return;

        }

        results.innerHTML = data.map(item => `

<div class="product-card fade">

<div class="badge">
${item.category || "Medicine"}
</div>

<h3>${item.name}</h3>

<p><strong>Company:</strong> ${item.company || "-"}</p>

<p><strong>Packing:</strong> ${item.packing || "-"}</p>

<p><strong>Category:</strong> ${item.category || "-"}</p>

<div class="new-price">
₹${item.price || "-"}
</div>

<div class="card-buttons">

<button class="buy-btn"
onclick="window.open('https://wa.me/919837100364?text=${encodeURIComponent("I want to order " + item.name)}')">

WhatsApp Order

</button>

</div>

</div>

        `).join("");

    }

    catch (err) {

        console.error(err);

        results.innerHTML = `
        <div class="empty">
            Server Error
        </div>
        `;

    }

}

// =========================================
// ENTER KEY
// =========================================

searchBox.addEventListener("keypress", function(e){

    if(e.key==="Enter"){

        searchMedicine();

    }

});

// =========================================
// LOAD DATABASE
// =========================================

loadMedicines();
    showDropdown(matches);

}

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function register() {
    let name = document.getElementById("regName").value.trim();
    let password = document.getElementById("regPassword").value.trim();
    let message = document.getElementById("message");

    if (name === "" || password === "") {
        message.innerText = "Fill all fields!";
        return;
    }

    let users = getUsers();
    let exists = users.find(u => u.name === name);

    if (exists) {
        message.innerText = "User already exists!";
        return;
    }

    users.push({ name, password });
    saveUsers(users);

    message.innerText = "Registered successfully!";
    document.getElementById("regName").value = "";
    document.getElementById("regPassword").value = "";
}

function login() {
    let name = document.getElementById("loginName").value.trim();
    let password = document.getElementById("loginPassword").value.trim();
    let message = document.getElementById("message");

    let users = getUsers();
    let user = users.find(u => u.name === name && u.password === password);

    if (!user) {
        message.innerText = "Invalid login!";
        return;
    }

    localStorage.setItem("currentUser", name);
    window.location.href = "browse.html";
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

function displayUsername() {
    let user = localStorage.getItem("currentUser");
    let display = document.getElementById("usernameDisplay");
    if (!display) return;
    display.innerText = user ? user : "Guest";
}

function goHome() {
    if (!localStorage.getItem("currentUser")) {
        window.location.href = "index.html";
    } else {
        window.location.href = "browse.html";
    }
}

function goBrowse() {
    window.location.href = "browse.html";
}

function goCart() {
    let reserved = localStorage.getItem("reservedItem");
    if (!reserved) {
        alert("No items in cart.");
        return;
    }
    window.location.href = "checkout.html";
}

function getListings() {
    return JSON.parse(localStorage.getItem("listings")) || [];
}

function saveListings(listings) {
    localStorage.setItem("listings", JSON.stringify(listings));
}

function createSampleListings() {
    let listings = getListings();

    if (listings.length === 0) {
        listings = [
            {
                id: 1,
                name: "Assorted Macarons",
                price: 5.40,
                status: "available",
                vendor: "Cookie's Bakery",
                location: "Building 3001, Road 5476, Riffa",
                expiry: "Expires in 56m",
                image: "https://images.unsplash.com/photo-1558326567-98ae2405596b?auto=format&fit=crop&w=900&q=80"
            },
            {
                id: 2,
                name: "Caramel Waffles",
                price: 4.30,
                status: "available",
                vendor: "Cup o’ Jo Cafe",
                location: "Building 2210, Avenue 12, Riffa",
                expiry: "Expires in 1h 20m",
                image: "https://images.unsplash.com/photo-1612182062633-9ff3b3598e96?auto=format&fit=crop&w=900&q=80"
            },
            {
                id: 3,
                name: "Chocolate Croissant",
                price: 5.10,
                status: "available",
                vendor: "Morning Bake",
                location: "Block 101, Road 22, Isa Town",
                expiry: "Expires in 2h",
                image: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=900&q=80"
            }
        ];
        saveListings(listings);
    }
}

function displayListings() {
    let container = document.getElementById("listings");
    if (!container) return;

    let listings = getListings();

    // show available and reserved, hide sold
    let visibleItems = listings.filter(item => item.status !== "sold");

    container.innerHTML = "";

    if (visibleItems.length === 0) {
        container.innerHTML = `
            <div class="card">
                <h3 style="text-align:center;">No available items</h3>
                <p style="text-align:center;">Check back later!</p>
            </div>
        `;
        return;
    }

    visibleItems.forEach(item => {
        let div = document.createElement("div");
        div.className = "listing-card";

        div.innerHTML = `
            <img class="food-image" src="${item.image || 'https://via.placeholder.com/400x180'}" alt="${item.name}">
            <div class="listing-content">
                <h3 class="listing-name">${item.name}</h3>
                <p class="vendor-name">${item.vendor || 'EchoEats Vendor'}</p>
                <p class="info-text">${item.location || 'Location not available'}</p>
                <p class="info-text">${item.expiry || 'Expiry not available'}</p>
                <p class="info-text">Status: ${item.status}</p>
                <div class="price-pill">$${Number(item.price).toFixed(2)}</div>
                <button class="view-btn" onclick="viewItem(${item.id})">View</button>
                <button class="secondary-btn" onclick="removeListing(${item.id})">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function addListing() {
    let nameInput = document.getElementById("itemName");
    let priceInput = document.getElementById("itemPrice");
    let imageInput = document.getElementById("itemImage");
    let addMessage = document.getElementById("addMessage");

    if (!nameInput || !priceInput || !imageInput || !addMessage) return;

    let name = nameInput.value.trim();
    let price = priceInput.value.trim();
    let image = imageInput.value.trim();

    if (name === "" || price === "") {
        addMessage.innerText = "Fill all required fields.";
        return;
    }

    let listings = getListings();

    let newItem = {
        id: Date.now(),
        name: name,
        price: Number(price),
        status: "available",
        vendor: "User Listing",
        location: "Custom Location",
        expiry: "Expires soon",
        image: image !== "" ? image : "https://via.placeholder.com/400x180?text=No+Image"
    };

    listings.push(newItem);
    saveListings(listings);
    displayListings();

    addMessage.innerText = "Listing added successfully.";
    nameInput.value = "";
    priceInput.value = "";
    imageInput.value = "";
}

function removeListing(id) {
    let listings = getListings().filter(item => item.id !== id);
    saveListings(listings);
    displayListings();
}

function viewItem(id) {
    localStorage.setItem("selectedItem", id);
    window.location.href = "details.html";
}

function displaySelectedItem() {
    let selectedId = localStorage.getItem("selectedItem");
    let listings = getListings();
    let item = listings.find(i => i.id == selectedId);
    let container = document.getElementById("itemDetails");

    if (!container) return;

    if (!item) {
        container.innerHTML = "<div class='card detail-card'><p>Item not found.</p></div>";
        return;
    }

    let buttons = "";

    if (item.status === "available") {
        buttons = `
            <button class="view-btn" onclick="reserveItem()">Reserve</button>
            <button class="secondary-btn" onclick="goBack()">Back</button>
        `;
    } else if (item.status === "reserved") {
        buttons = `
            <button class="checkout-btn" onclick="goToCheckout()">Go to Checkout</button>
            <button class="secondary-btn" onclick="goBack()">Back</button>
        `;
    } else {
        buttons = `
            <button class="secondary-btn" onclick="goBack()">Back</button>
        `;
    }

    container.innerHTML = `
        <div class="listing-card detail-card">
            <img class="food-image" src="${item.image || 'https://via.placeholder.com/400x180'}" alt="${item.name}">
            <div class="listing-content">
                <h2>${item.name}</h2>
                <p class="vendor-name">${item.vendor || 'EchoEats Vendor'}</p>
                <p class="info-text">${item.location || 'Location not available'}</p>
                <p class="info-text">${item.expiry || 'Expiry not available'}</p>
                <p class="info-text">Status: ${item.status}</p>
                <div class="price-pill">$${Number(item.price).toFixed(2)}</div>
                ${buttons}
            </div>
        </div>
    `;
}

function reserveItem() {
    let selectedId = localStorage.getItem("selectedItem");
    let listings = getListings();
    let item = listings.find(i => i.id == selectedId);
    let detailMessage = document.getElementById("detailMessage");

    if (!item) {
        if (detailMessage) detailMessage.innerText = "Item not found.";
        return;
    }

    if (item.status !== "available") {
        if (detailMessage) detailMessage.innerText = "Item is not available.";
        return;
    }

    localStorage.removeItem("reservedItem");

    item.status = "reserved";
    saveListings(listings);
    localStorage.setItem("reservedItem", item.id);

    if (detailMessage) detailMessage.innerText = "Item reserved successfully!";
    displaySelectedItem();
    displayListings();
}

function goToCheckout() {
    let selectedId = localStorage.getItem("selectedItem");
    let listings = getListings();
    let item = listings.find(i => i.id == selectedId);
    let detailMessage = document.getElementById("detailMessage");

    if (!item) {
        if (detailMessage) detailMessage.innerText = "Item not found.";
        return;
    }

    if (item.status !== "reserved") {
        if (detailMessage) detailMessage.innerText = "Reserve the item first.";
        return;
    }

    localStorage.setItem("reservedItem", item.id);
    window.location.href = "checkout.html";
}

function goBack() {
    window.location.href = "browse.html";
}

function displayCheckout() {
    let reservedId = localStorage.getItem("reservedItem");
    let listings = getListings();
    let item = listings.find(i => i.id == reservedId);
    let container = document.getElementById("checkoutDetails");

    if (!container) return;

    if (!item) {
        container.innerHTML = "<div class='card checkout-card'><p>No item in cart.</p></div>";
        return;
    }

    container.innerHTML = `
        <div class="listing-card checkout-card">
            <img class="food-image" src="${item.image || 'https://via.placeholder.com/400x180'}" alt="${item.name}">
            <div class="listing-content">
                <h2>${item.name}</h2>
                <p class="vendor-name">${item.vendor || 'EchoEats Vendor'}</p>
                <p class="info-text">${item.location || 'Location not available'}</p>
                <p class="info-text">${item.expiry || 'Expiry not available'}</p>
                <div class="price-pill">$${Number(item.price).toFixed(2)}</div>
                <div class="total-box">Total: $${Number(item.price).toFixed(2)}</div>
                <button class="secondary-btn" onclick="removeFromCart()">Remove From Cart</button>
            </div>
        </div>
    `;
}

function completeCheckout() {
    let reservedId = localStorage.getItem("reservedItem");
    let listings = getListings();
    let item = listings.find(i => i.id == reservedId);
    let checkoutMessage = document.getElementById("checkoutMessage");

    if (!item) {
        if (checkoutMessage) checkoutMessage.innerText = "No item in cart.";
        return;
    }

    item.status = "sold";
    saveListings(listings);
    localStorage.removeItem("reservedItem");

    if (checkoutMessage) checkoutMessage.innerText = "Payment completed successfully!";
    displayCheckout();
}

function removeFromCart() {
    let reservedId = localStorage.getItem("reservedItem");
    let listings = getListings();
    let item = listings.find(i => i.id == reservedId);
    let checkoutMessage = document.getElementById("checkoutMessage");

    if (!item) {
        if (checkoutMessage) checkoutMessage.innerText = "No item in cart.";
        return;
    }

    item.status = "available";
    saveListings(listings);
    localStorage.removeItem("reservedItem");

    if (checkoutMessage) checkoutMessage.innerText = "Item removed from cart.";
    displayCheckout();
}

function cancelCheckout() {
    removeFromCart();
}

function backToBrowse() {
    window.location.href = "browse.html";
}

if (window.location.pathname.includes("browse.html")) {
    createSampleListings();
    displayListings();
}

if (window.location.pathname.includes("details.html")) {
    displaySelectedItem();
}

if (window.location.pathname.includes("checkout.html")) {
    displayCheckout();
}

displayUsername();
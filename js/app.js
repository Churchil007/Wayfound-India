// ============================================================
// WAYFOUND INDIA - APP.JS
// ============================================================

const API_BASE = "http://localhost:4000/api";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let sites = [];

let visitedSites = new Set();

let markers = [];

let selectedCategory = "all";

let selectedSite = null;


// ============================================================
// CATEGORY COLORS
// ============================================================

const categoryColors = {

    museum: "#2677e8",

    gallery: "#e83991",

    fort: "#f36d18",

    palace: "#8a4de8",

    temple: "#249b50",

    mosque: "#168f8b",

    church: "#e7a900",

    monument: "#d82d2d",

    "heritage site": "#974512",

    "historic site": "#34485f",

    other: "#728096"

};


// ============================================================
// INITIALIZE MAP
// ============================================================

const map = L.map("map", {

    zoomControl: true,

    minZoom: 4,

    maxZoom: 18

});


// OpenStreetMap
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// India view
map.setView(
    [22.5, 79.0],
    5
);


// ============================================================
// LOAD DATA
// ============================================================

async function initialize() {

    try {

        await loadVisited();

        await loadSites();

        setupEvents();

        updateStatistics();

    } catch (error) {

        console.error(
            "Initialization failed:",
            error
        );

    }

}


// ============================================================
// LOAD SITES
// ============================================================

async function loadSites() {

    const response = await fetch(
        `${API_BASE}/sites`
    );

    if (!response.ok) {

        throw new Error(
            "Unable to load sites"
        );

    }

    sites = await response.json();

    console.log(
        "Sites loaded:",
        sites
    );

    document.getElementById(
        "totalSites"
    ).textContent = sites.length;

    document.getElementById(
        "journeyExplore"
    ).textContent = sites.length;

    renderSites();

}


// ============================================================
// LOAD VISITED SITES
// ============================================================

async function loadVisited() {

    try {

        const response = await fetch(
            `${API_BASE}/visited`
        );

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();

        visitedSites =
            new Set(
                (data.visited || [])
                    .map(id => String(id))
            );

    } catch (error) {

        console.warn(
            "Could not load visited sites:",
            error
        );

    }

}


// ============================================================
// RENDER SITES
// ============================================================

function renderSites() {

    clearMarkers();

    const searchText =
        document
            .getElementById("searchInput")
            .value
            .trim()
            .toLowerCase();


    const filteredSites =
        sites.filter(site => {

            // CATEGORY FILTER
            if (
                selectedCategory !== "all" &&
                normalizeCategory(
                    site.category
                ) !==
                normalizeCategory(
                    selectedCategory
                )
            ) {

                return false;

            }


            // SEARCH FILTER
            if (!searchText) {
                return true;
            }

            const text = [

                site.name,

                site.city,

                site.state,

                site.category,

                site.description

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return text.includes(
                searchText
            );

        });


    filteredSites.forEach(
        site => createMarker(site)
    );


    updateStatistics(
        filteredSites
    );

}


// ============================================================
// CREATE MARKER
// ============================================================

function createMarker(site) {

    const lat =
        Number(
            site.lat ??
            site.latitude
        );

    const lng =
        Number(
            site.lng ??
            site.lon ??
            site.longitude
        );


    if (
        Number.isNaN(lat) ||
        Number.isNaN(lng)
    ) {

        console.warn(
            "Invalid coordinates:",
            site
        );

        return;

    }


    const visited =
        visitedSites.has(
            String(site.id)
        );


    const category =
        normalizeCategory(
            site.category
        );


    const markerClass =
        getMarkerClass(
            category
        );


    const icon =
        L.divIcon({

            className: "",

            html: `
                <div class="
                    custom-marker
                    ${markerClass}
                    ${visited ? "visited-marker" : ""}
                ">
                    <span>●</span>
                </div>
            `,

            iconSize: [
                32,
                32
            ],

            iconAnchor: [
                16,
                32
            ],

            popupAnchor: [
                0,
                -32
            ]

        });


    const marker =
        L.marker(
            [lat, lng],
            {
                icon
            }
        ).addTo(map);


    marker.bindTooltip(
        site.name || "Cultural Site",
        {
            direction: "top",
            offset: [0, -20]
        }
    );


    marker.on(
        "click",
        () => {

            selectSite(site);

        }
    );


    markers.push(marker);

}


// ============================================================
// SELECT SITE
// ============================================================

function selectSite(site) {

    selectedSite = site;

    const panel =
        document.getElementById(
            "detailsPanel"
        );


    const visited =
        visitedSites.has(
            String(site.id)
        );


    const image =
        site.image ||
        site.imageUrl ||
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80";


    panel.innerHTML = `

        <img
            class="site-image"
            src="${escapeHtml(image)}"
            alt="${escapeHtml(site.name || "")}"
            onerror="
                this.style.display='none'
            "
        >

        <h2>
            ${escapeHtml(
                site.name ||
                "Cultural Site"
            )}
        </h2>

        <div class="location">
            📍
            ${escapeHtml(
                site.city || ""
            )},
            ${escapeHtml(
                site.state || ""
            )}
        </div>

        <span class="category-label">
            ${escapeHtml(
                site.category ||
                "Other"
            )}
        </span>

        <p class="description">
            ${escapeHtml(
                site.description ||
                "Explore this cultural site."
            )}
        </p>

        <div class="info-row">
            <span class="info-label">
                Type
            </span>

            <span class="info-value">
                ${escapeHtml(
                    site.category ||
                    "Other"
                )}
            </span>
        </div>

        <div class="info-row">
            <span class="info-label">
                State
            </span>

            <span class="info-value">
                ${escapeHtml(
                    site.state ||
                    "India"
                )}
            </span>
        </div>

        ${
            site.period
            ?
            `
            <div class="info-row">

                <span class="info-label">
                    Period
                </span>

                <span class="info-value">
                    ${escapeHtml(
                        site.period
                    )}
                </span>

            </div>
            `
            :
            ""
        }

        ${
            site.website
            ?
            `
            <div class="info-row">

                <span class="info-label">
                    Website
                </span>

                <span class="info-value">

                    <a
                        href="${escapeHtml(site.website)}"
                        target="_blank"
                        rel="noopener"
                    >
                        Visit Website
                    </a>

                </span>

            </div>
            `
            :
            ""
        }


        <button
            id="visitedButton"
            class="
                visited-button
                ${visited ? "already-visited" : ""}
            "
            ${visited ? "disabled" : ""}
        >

            ${
                visited
                ? "✓ Already Visited"
                : "✓ Mark as Visited"
            }

        </button>

    `;


    const button =
        document.getElementById(
            "visitedButton"
        );


    if (button && !visited) {

        button.addEventListener(
            "click",
            () => markAsVisited(site)
        );

    }


    // Zoom to site
    const lat =
        Number(
            site.lat ??
            site.latitude
        );

    const lng =
        Number(
            site.lng ??
            site.lon ??
            site.longitude
        );


    if (
        !Number.isNaN(lat) &&
        !Number.isNaN(lng)
    ) {

        map.flyTo(
            [lat, lng],
            8,
            {
                duration: 1
            }
        );

    }

}


// ============================================================
// MARK AS VISITED
// ============================================================

async function markAsVisited(site) {

    try {

        const response =
            await fetch(
                `${API_BASE}/visited`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        siteId: site.id
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to mark visited"
            );

        }


        visitedSites =
            new Set(
                data.visited.map(
                    id => String(id)
                )
            );


        selectSite(site);

        renderSites();

        updateStatistics();


        showMessage(
            "✓ Place marked as visited"
        );


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to save visited status"
        );

    }

}


// ============================================================
// UPDATE STATISTICS
// ============================================================

function updateStatistics(
    filteredSites = sites
) {

    const visitedCount =
        visitedSites.size;


    document.getElementById(
        "visitedCount"
    ).textContent =
        visitedCount;


    document.getElementById(
        "journeyVisited"
    ).textContent =
        visitedCount;


    document.getElementById(
        "journeyExplore"
    ).textContent =
        Math.max(
            0,
            sites.length -
            visitedCount
        );

}


// ============================================================
// CLEAR MARKERS
// ============================================================

function clearMarkers() {

    markers.forEach(
        marker => {

            map.removeLayer(
                marker
            );

        }
    );

    markers = [];

}


// ============================================================
// CATEGORY
// ============================================================

function normalizeCategory(
    category
) {

    return String(
        category || "Other"
    )
        .trim()
        .toLowerCase();

}


function getMarkerClass(
    category
) {

    const mapClasses = {

        museum:
            "marker-museum",

        gallery:
            "marker-gallery",

        fort:
            "marker-fort",

        palace:
            "marker-palace",

        temple:
            "marker-temple",

        mosque:
            "marker-mosque",

        church:
            "marker-church",

        monument:
            "marker-monument",

        "heritage site":
            "marker-heritage",

        "historic site":
            "marker-historic"

    };


    return (
        mapClasses[category] ||
        "marker-other"
    );

}


// ============================================================
// EVENTS
// ============================================================

function setupEvents() {

    // SEARCH

    document
        .getElementById(
            "searchInput"
        )
        .addEventListener(
            "input",
            renderSites
        );


    // CATEGORY BUTTONS

    document
        .querySelectorAll(
            ".category-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".category-btn"
                        )
                        .forEach(btn =>
                            btn.classList.remove(
                                "active"
                            )
                        );


                    button.classList.add(
                        "active"
                    );


                    selectedCategory =
                        button.dataset.category;


                    renderSites();

                }
            );

        });


    // SHOW ALL

    document
        .getElementById(
            "showAllBtn"
        )
        .addEventListener(
            "click",
            () => {

                selectedCategory =
                    "all";


                document
                    .querySelectorAll(
                        ".category-btn"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                document
                    .querySelector(
                        '[data-category="all"]'
                    )
                    .classList.add(
                        "active"
                    );


                document
                    .getElementById(
                        "searchInput"
                    )
                    .value = "";


                renderSites();

            }
        );


    // RESET MAP

    document
        .getElementById(
            "resetMapBtn"
        )
        .addEventListener(
            "click",
            () => {

                map.setView(
                    [22.5, 79],
                    5
                );

            }
        );

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    message
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        message;


    element.style.position =
        "fixed";

    element.style.bottom =
        "25px";

    element.style.right =
        "25px";

    element.style.zIndex =
        "9999";

    element.style.padding =
        "13px 20px";

    element.style.background =
        "#249b50";

    element.style.color =
        "white";

    element.style.borderRadius =
        "8px";

    element.style.boxShadow =
        "0 4px 15px rgba(0,0,0,.2)";


    document.body.appendChild(
        element
    );


    setTimeout(
        () => element.remove(),
        2500
    );

}


// ============================================================
// SECURITY
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// START
// ============================================================

initialize();
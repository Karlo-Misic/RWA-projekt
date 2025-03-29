const apiKljuc = "48391313a9ca7e086f3e2d28e315060e";
const osnovniUrl = "https://api.themoviedb.org/3";
const slikeUrl = "https://image.tmdb.org/t/p/original";
let trenutnaStranica = 1;
let brojPoStranici = 10;

const osobaKontejner = document.getElementById("osobaKontejner");
const paginacija = document.getElementById("paginacija");
const brojPoStraniciSelect = document.getElementById("brojPoStranici");

async function dohvatiOsobe(stranica, brojPoStranici) {
	const odgovor = await fetch(
		`${osnovniUrl}/person/popular?language=hr-HR&page=${stranica}&api_key=${apiKljuc}`
	);
	const podaci = await odgovor.json();
	return podaci.results.slice(0, brojPoStranici);
}

async function prikaziOsobe(stranica, brojPoStranici) {
	const osobe = await dohvatiOsobe(stranica, brojPoStranici);

	osobaKontejner.innerHTML = "";
	osobe.forEach((osoba) => {
		const osobaDiv = document.createElement("div");
		osobaDiv.classList.add("osoba");

		const slikaOsobe = osoba.profile_path
			? `${slikeUrl}${osoba.profile_path}`
			: "https://via.placeholder.com/200x300?text=Nema+slike";

		osobaDiv.innerHTML = `
            <img src="${slikaOsobe}" alt="${osoba.name}" data-id="${osoba.id}" />
            <h3>${osoba.name}</h3>
            <p>Poznat/poznata po: ${osoba.known_for_department}</p>
        `;

		osobaDiv.querySelector("img").addEventListener("click", () => {
			window.location.href = `detalji?id=${osoba.id}`;
		});

		osobaKontejner.appendChild(osobaDiv);
	});

	postaviPaginaciju();
}

function postaviPaginaciju() {
	paginacija.innerHTML = `
        <button ${
					trenutnaStranica === 1 ? "disabled" : ""
				} onclick="promijeniStranicu(trenutnaStranica - 1)">Prethodna</button>
        <span>Stranica ${trenutnaStranica}</span>
        <button onclick="promijeniStranicu(trenutnaStranica + 1)">Sljedeća</button>
    `;
}

function promijeniStranicu(stranica) {
	trenutnaStranica = stranica;
	prikaziOsobe(trenutnaStranica, brojPoStranici);
}

brojPoStraniciSelect.addEventListener("change", (event) => {
	brojPoStranici = parseInt(event.target.value, 10);
	trenutnaStranica = 1;
	prikaziOsobe(trenutnaStranica, brojPoStranici);
});

prikaziOsobe(trenutnaStranica, brojPoStranici);

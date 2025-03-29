const apiKljuc = "48391313a9ca7e086f3e2d28e315060e";
const osnovniUrl = "https://api.themoviedb.org/3";
const slikeUrl = "https://image.tmdb.org/t/p/original";

const parametri = new URLSearchParams(window.location.search);
const osobaId = parametri.get("id");

const detaljiOsobeDiv = document.getElementById("detaljiOsobe");
const galerijaDiv = document.getElementById("galerija");
const filmoviTabela = document.getElementById("filmovi").querySelector("tbody");
const ucitajJosBtn = document.getElementById("ucitajJos");

let filmoviStranica = 1;

async function dohvatiDetaljeOsobe(id) {
	const odgovor = await fetch(`${osnovniUrl}/person/${id}?api_key=${apiKljuc}`);
	return await odgovor.json();
}

async function dohvatiGalerijuOsobe(id) {
	const odgovor = await fetch(
		`${osnovniUrl}/person/${id}/images?api_key=${apiKljuc}`
	);
	return await odgovor.json();
}

async function dohvatiFilmoveOsobe(id, stranica) {
	const odgovor = await fetch(
		`${osnovniUrl}/person/${id}/movie_credits?api_key=${apiKljuc}&page=${stranica}`
	);
	return await odgovor.json();
}

async function prikaziDetaljeOsobe() {
	const osoba = await dohvatiDetaljeOsobe(osobaId);

	const slikaOsobe = osoba.profile_path
		? `${slikeUrl}${osoba.profile_path}`
		: "https://via.placeholder.com/300x450?text=Nema+slike";

	detaljiOsobeDiv.innerHTML = `
        <img src="${slikaOsobe}" alt="${osoba.name}" />
        <h2>${osoba.name}</h2>
        <p>Poznat/poznata po: ${osoba.known_for_department}</p>
        <p>Popularnost: ${osoba.popularity}</p>
    `;
}

async function prikaziGalerijuOsobe() {
	const galerija = await dohvatiGalerijuOsobe(osobaId);

	galerijaDiv.innerHTML = "";
	galerija.profiles.forEach((slika) => {
		const slikaUrl = `${slikeUrl}${slika.file_path}`;
		galerijaDiv.innerHTML += `<img src="${slikaUrl}" alt="Slika osobe" />`;
	});
}

async function prikaziFilmoveOsobe() {
	const filmovi = await dohvatiFilmoveOsobe(osobaId, filmoviStranica);

	filmovi.cast.slice(0, 20).forEach((film) => {
		const filmRed = document.createElement("tr");
		filmRed.style.position = "relative";

		const poster = film.poster_path
			? `<img src="${slikeUrl}${film.poster_path}" alt="Poster" style="max-width: 50px;" />`
			: "N/A";

		const jezikTd = document.createElement("td");
		jezikTd.textContent = film.original_language || "N/A";

		const originalniNaslovTd = document.createElement("td");
		originalniNaslovTd.textContent = film.original_title || "N/A";
		originalniNaslovTd.style.cursor = "pointer";

		const naslovTd = document.createElement("td");
		naslovTd.textContent = film.title || "N/A";
		naslovTd.style.cursor = "pointer";

		const popularnostTd = document.createElement("td");
		popularnostTd.textContent = film.popularity || "N/A";

		const posterTd = document.createElement("td");
		posterTd.innerHTML = poster;

		const datumTd = document.createElement("td");
		datumTd.textContent = film.release_date || "N/A";

		const likTd = document.createElement("td");
		likTd.textContent = film.character || "N/A";

		const opisDiv = document.createElement("div");
		opisDiv.style.position = "absolute";
		opisDiv.style.top = "100%";
		opisDiv.style.left = "0";
		opisDiv.style.zIndex = "10";
		opisDiv.style.backgroundColor = "#f9f9f9";
		opisDiv.style.border = "1px solid #ccc";
		opisDiv.style.boxShadow = "0px 4px 8px rgba(0,0,0,0.2)";
		opisDiv.style.padding = "10px";
		opisDiv.style.display = "none";
		opisDiv.style.maxWidth = "400px";
		opisDiv.textContent = film.overview || "Nema opisa";

		const prikaziOpis = () => {
			opisDiv.style.display = "block";
		};

		const sakrijOpis = () => {
			opisDiv.style.display = "none";
		};

		originalniNaslovTd.addEventListener("mouseenter", prikaziOpis);
		originalniNaslovTd.addEventListener("mouseleave", sakrijOpis);
		naslovTd.addEventListener("mouseenter", prikaziOpis);
		naslovTd.addEventListener("mouseleave", sakrijOpis);

		filmRed.appendChild(jezikTd);
		filmRed.appendChild(originalniNaslovTd);
		filmRed.appendChild(naslovTd);
		filmRed.appendChild(popularnostTd);
		filmRed.appendChild(posterTd);
		filmRed.appendChild(datumTd);
		filmRed.appendChild(likTd);

		filmRed.appendChild(opisDiv);

		filmoviTabela.appendChild(filmRed);
	});

	if (filmovi.cast.length > 20) {
		ucitajJosBtn.style.display = "block";
	} else {
		ucitajJosBtn.style.display = "none";
	}
}

ucitajJosBtn.addEventListener("click", () => {
	filmoviStranica++;
	prikaziFilmoveOsobe();
});

prikaziDetaljeOsobe();
prikaziGalerijuOsobe();
prikaziFilmoveOsobe();

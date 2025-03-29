console.log(citajRestPortIzKolacica);

let url =
	"http://" + window.location.hostname + ":" + citajRestPortIzKolacica();

console.log(url);

async function dohvatiZanrove() {
	let odgovor = await fetch(url + "/servis/tmdb/zanr");
	let podaci = await odgovor.text();
	console.log(podaci);
	let zanrovi = JSON.parse(podaci);
	return zanrovi;
}

window.addEventListener("load", async () => {
	let main = document.getElementsByTagName("main")[0];
	let prikaz = "<ol>";
	for (let p of await dohvatiZanrove()) {
		prikaz += "<li>" + p.name;
		let filmovi = await dohvatiFilmove(p.name);

		prikaz += "<ul>";
		prikaz += "<li>" + filmovi[0]["original_title"] + "</li>";
		prikaz += "<li>" + filmovi[0]["original_title"] + "</li>";
		prikaz += "</ul>";

		prikaz += "</li>";
	}
	main.innerHTML = prikaz + "</ol>";
});

async function dohvatiFilmove(zanr) {
	let odgovor = await fetch(url + "/servis/tmdb/nasumceFilm?zanr=" + zanr);
	let podaci = await odgovor.text();
	let filmovi = JSON.parse(podaci);
	return filmovi;
}

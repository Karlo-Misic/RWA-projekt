function citajRestPortIzKolacica() {
	console.log(document.cookie);
	const cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		if (cookie.startsWith("portRest=")) {
			return cookie.substring("portRest=".length);
		}
	}
	return null;
}

async function dajToken() {
	let odgovor = await fetch("/getJWT");
	let tekst = JSON.parse(await odgovor.text());
	if (tekst.ok != null) return tekst.ok;
	else return "0000";
}

async function dodajToken(parametri = {}) {
	let zaglavlje = new Headers();
	if (parametri.headers != null) zaglavlje = parametri.headers;
	let token = await dajToken();
	zaglavlje.set("Authorization", "Authorization:Bearer " + token);
	parametri.headers = zaglavlje;
	console.log(parametri);
	return parametri;
}

function prikaziStranicenje(str, ukupno, funkcijaZaDohvat) {
	let prikaz = document.getElementById("stranicenje");
	html = "";
	str = parseInt(str);
	if (str > 1) {
		html = '<button onClick="' + funkcijaZaDohvat + '(1)"><<</button>';
		html +=
			'<button onClick="' +
			funkcijaZaDohvat +
			"(" +
			(str - 1) +
			')"><</button>';
	}
	html +=
		'<button onClick="' +
		funkcijaZaDohvat +
		"(" +
		str +
		')">' +
		str +
		"/" +
		ukupno +
		"</button>";
	if (str < ukupno) {
		html +=
			'<button onClick="' +
			funkcijaZaDohvat +
			"(" +
			(str + 1) +
			')">></button>';
		html +=
			'<button onClick="' + funkcijaZaDohvat + "(" + ukupno + ')">>></button>';
	}
	prikaz.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function () {
	const korime = getCookie("korime");

	const baseUrl =
		window.location.hostname === "spider.foi.hr"
			? `http://spider.foi.hr:12203`
			: `http://localhost:12222`;

	if (korime) {
		fetch(`${baseUrl}/servis/korisnici/${korime}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Greška pri dohvaćanju podataka: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				if (data) {
					document.getElementById("ime").textContent = data.ime;
					document.getElementById("prezime").textContent = data.prezime;
					document.getElementById("korime").textContent = data.korime;
					document.getElementById("email").textContent = data.email;
					document.getElementById("adresa").textContent = data.adresa || "N/A";
					document.getElementById("brojMobitela").textContent =
						data.brojMobitela || "N/A";
					document.getElementById("spol").textContent = data.spol || "N/A";
					document.getElementById("zahtjevZaPristup").textContent =
						data.zahtjevZaPristup;

					const zahtjevContainer = document.getElementById("zahtjevContainer");
					const navigacija = document.querySelector("nav");

					if (data.zahtjevZaPristup === "Nema pristup") {
						zahtjevContainer.style.display = "block";

						const links = navigacija.querySelectorAll("a");
						links.forEach((link) => {
							if (
								!link.href.includes("dokumentacija") &&
								!link.href.includes("profil") &&
								!link.href.includes("odjava")
							) {
								link.style.display = "none";
							} else {
								link.style.display = "inline-block";
							}
						});
					} else {
						zahtjevContainer.style.display = "none";
					}

					if (data.zahtjevZaPristup === "pending") {
						zahtjevContainer.style.display = "none";
						navigacija.style.display = "block";

						const links = navigacija.querySelectorAll("a");
						links.forEach((link) => {
							if (
								!link.href.includes("dokumentacija") &&
								!link.href.includes("profil") &&
								!link.href.includes("odjava")
							) {
								link.style.display = "none";
							} else {
								link.style.display = "inline-block";
								link.style.color = "white";
								link.style.textDecoration = "none";
								link.style.margin = "0 15px";
								link.style.fontSize = "16px";
								link.style.transition = "color 0.3s ease";

								link.addEventListener("mouseover", () => {
									link.style.color = "#00bcd4";
								});
								link.addEventListener("mouseout", () => {
									link.style.color = "white";
								});
							}
						});
					} else if (data.zahtjevZaPristup === "Ima pristup") {
						navigacija.style.display = "block";
						navigacija.style.display = "flex";
						navigacija.style.justifyContent = "space-between";
						navigacija.style.alignItems = "center";
						navigacija.style.backgroundColor = "#333";
						navigacija.style.color = "white";
						navigacija.style.padding = "10px 10px";
						navigacija.style.position = "fixed";
						navigacija.style.top = "0";
						navigacija.style.left = "0";
						navigacija.style.width = "100%";
						navigacija.style.zIndex = "1000";
						navigacija.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";

						const links = navigacija.querySelectorAll("a");
						links.forEach((link) => {
							link.style.color = "white";
							link.style.textDecoration = "none";
							link.style.margin = "0 15px";
							link.style.fontSize = "16px";
							link.style.transition = "color 0.3s ease";

							link.addEventListener("mouseover", () => {
								link.style.color = "#00bcd4";
							});
							link.addEventListener("mouseout", () => {
								link.style.color = "white";
							});
						});
					} else {
						navigacija.style.display = "block";
					}

					document
						.getElementById("posaljiteZahtjev")
						.addEventListener("click", function () {
							const button = this;

							fetch(`${baseUrl}/servis/korisnici/${korime}/zahtjev`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({}),
							})
								.then((response) => response.json())
								.then((data) => {
									alert("Zahtjev za pristup je poslan!");
									console.log(data);
									button.disabled = true;
									button.textContent = "Zahtjev poslan";
								})
								.catch((error) => {
									console.error("Greška pri slanju zahtjeva:", error);
								});
						});
				} else {
					console.error("Podaci o korisniku nisu dostupni.");
					document.getElementById("profil").innerHTML =
						"<p>Podaci o korisniku nisu dostupni.</p>";
				}
			})
			.catch((error) => {
				console.error("Greška pri dohvaćanju podataka:", error);
				document.getElementById("profil").innerHTML =
					"<p>Došlo je do pogreške pri dohvaćanju podataka korisnika.</p>";
			});
	}
});

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(";").shift();
}

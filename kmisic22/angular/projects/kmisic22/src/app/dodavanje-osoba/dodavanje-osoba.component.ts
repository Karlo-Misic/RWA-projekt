import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dodavanje-osoba',
  templateUrl: './dodavanje-osoba.component.html',
  styleUrls: ['./dodavanje-osoba.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class DodavanjeOsobaComponent {
  imeOsobe: string = '';
  rezultatiPretrage: any[] = [];
  private apiKljuc: string = '48391313a9ca7e086f3e2d28e315060e';
  private osnovniUrl: string = 'https://api.themoviedb.org/3';
  private baseUrl: string =
    window.location.hostname === 'spider.foi.hr'
      ? 'http://spider.foi.hr:12203'
      : 'http://localhost:12222';

  constructor(private http: HttpClient) {}

  traziOsobe(): void {
    if (!this.imeOsobe.trim()) {
      alert('Molimo unesite ime osobe za pretraživanje.');
      return;
    }

    this.http
      .get<any>(
        `${this.osnovniUrl}/search/person?api_key=${this.apiKljuc}&query=${this.imeOsobe}`
      )
      .subscribe({
        next: (response) => {
          this.rezultatiPretrage = response.results || [];
          if (this.rezultatiPretrage.length === 0) {
            alert('Nema rezultata za unijeti pojam.');
          }
        },
        error: (error) => {
          console.error('Greška pri pretraživanju:', error);
          alert('Došlo je do greške pri pretraživanju osoba.');
        },
      });
  }

  async dodajOsobu(osobaIdTMDB: string): Promise<void> {
    try {
      const proveriOsobuResponse = await this.http
        .get(`${this.baseUrl}/servis/osoba/${osobaIdTMDB}`)
        .toPromise();

      if (proveriOsobuResponse) {
        alert('Osoba već postoji u bazi.');
        return;
      }
    } catch {}

    try {
      const osobaPodaci: any = await this.http
        .get(
          `${this.osnovniUrl}/person/${osobaIdTMDB}?api_key=${this.apiKljuc}`
        )
        .toPromise();

      const osobaZaSlanje = {
        id: osobaPodaci.id,
        ime_i_prezime: osobaPodaci.name,
        poznat_po: osobaPodaci.known_for_department || 'N/A',
        popularnost: osobaPodaci.popularity || 0,
        slika: osobaPodaci.profile_path
          ? `https://image.tmdb.org/t/p/original${osobaPodaci.profile_path}`
          : null,
        lik: osobaPodaci.also_known_as?.join(', ') || 'N/A',
      };

      const dodajOsobuResponse = await this.http
        .post(`${this.baseUrl}/servis/osoba`, osobaZaSlanje)
        .toPromise();

      const zadnjaOsobaOdgovor: any = await this.http
        .get(`${this.baseUrl}/servis/zadnja-osoba`)
        .toPromise();

      const osobaIdBaza = zadnjaOsobaOdgovor.id;

      const filmoviPodaci: any = await this.http
        .get(
          `${this.osnovniUrl}/person/${osobaIdTMDB}/movie_credits?api_key=${this.apiKljuc}`
        )
        .toPromise();

      for (const film of filmoviPodaci.cast) {
        if (!film.id) continue;

        const filmZaSlanje = {
          originalni_naslov: film.original_title || 'N/A',
          naslov: film.title || 'N/A',
          popularnost: film.popularity || 0,
          slika_postera: film.poster_path
            ? `https://image.tmdb.org/t/p/original${film.poster_path}`
            : null,
          jezik: film.original_language || 'N/A',
          datum_izdavanja: film.release_date || null,
          opis_filma: film.overview || 'Nema opisa',
        };

        const dodaniFilm: any = await this.http
          .post(`${this.baseUrl}/servis/film`, filmZaSlanje)
          .toPromise();

        await this.http
          .put(`${this.baseUrl}/servis/osoba/${osobaIdBaza}/film`, {
            filmovi: [dodaniFilm.id],
          })
          .toPromise();
      }

      alert('Sve je uspješno dodano: osoba i filmovi su povezani.');
    } catch (error) {
      console.error('Greška pri dodavanju osobe:', error);
      alert('Došlo je do greške pri dodavanju osobe.');
    }
  }

  async obrisiOsobu(osobaIdTMDB: string): Promise<void> {
    const potvrda = confirm(
      'Jeste li sigurni da želite obrisati ovu osobu i sve povezane filmove?'
    );
    if (!potvrda) return;

    try {
      await this.http
        .delete(`${this.baseUrl}/servis/osoba/${osobaIdTMDB}`)
        .toPromise();
      alert('Osoba i svi povezani filmovi su uspješno obrisani.');
    } catch (error) {
      console.error('Greška pri brisanju osobe:', error);
      alert('Došlo je do greške pri brisanju osobe.');
    }
  }
}

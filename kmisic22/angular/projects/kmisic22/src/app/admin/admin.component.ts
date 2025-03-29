import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class AdminComponent implements OnInit {
  baseUrl =
    window.location.hostname === 'spider.foi.hr'
      ? `http://spider.foi.hr:12203`
      : `http://localhost:12222`;

  trenutnaUloga: string | undefined;
  trenutniKorisnik: string | undefined;
  korisnici: any[] = [];
  zahtjevi: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.trenutnaUloga = this.getCookie('uloga');
    this.trenutniKorisnik = this.getCookie('korime');
    this.dohvatiKorisnike();
  }

  getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  }

  async dohvatiKorisnike(): Promise<void> {
    try {
      const response: any = await this.http
        .get(`${this.baseUrl}/servis/dohvatiKorisnike`)
        .toPromise();

      if (Array.isArray(response)) {
        this.korisnici = response.filter(
          (korisnik) => korisnik.zahtjevZaPristup !== 'pending'
        );
        this.zahtjevi = response.filter(
          (korisnik) => korisnik.zahtjevZaPristup === 'pending'
        );
      } else {
        console.error('Odgovor nije u očekivanom formatu:', response);
      }
    } catch (error) {
      console.error('Greška pri dohvatu korisnika:', error);
    }
  }

  async odobriPristup(korime: string): Promise<void> {
    if (korime === this.trenutniKorisnik) {
      alert('Ne možete obrisati svoj vlastiti račun.');
      return;
    }

    try {
      const response = await this.http
        .put(`${this.baseUrl}/servis/korisnici/${korime}/status`, {
          status: 'approved',
        })
        .toPromise();

      alert(`Pristup korisniku ${korime} je odobren.`);
      this.zahtjevi = this.zahtjevi.filter((z) => z.korime !== korime);
    } catch (error) {
      console.error('Greška pri odobravanju pristupa:', error);
    }
  }

  async zabraniPristup(korime: string): Promise<void> {
    try {
      const response = await this.http
        .put(`${this.baseUrl}/servis/korisnici/${korime}/status`, {
          status: 'zahtjevNijePoslan',
        })
        .toPromise();

      alert(`Pristup korisniku ${korime} je zabranjen.`);
      this.zahtjevi = this.zahtjevi.filter((z) => z.korime !== korime);
    } catch (error) {
      console.error('Greška pri zabrani pristupa:', error);
    }
  }

  async obrisiKorisnika(korime: string): Promise<void> {
    try {
      const response = await this.http
        .put(`${this.baseUrl}/servis/korisnici/${korime}/status`, {
          status: '',
        })
        .toPromise();

      alert(`Korisniku ${korime} je postavljen prazan zahtjev za pristup.`);
      this.korisnici = this.korisnici.filter((k) => k.korime !== korime);
    } catch (error) {
      console.error('Greška pri brisanju korisnika:', error);
    }
  }
}

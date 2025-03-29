import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class RegistracijaComponent {
  korisnik = {
    ime: '',
    prezime: '',
    adresa: '',
    korime: '',
    lozinka: '',
    email: '',
    brojMobitela: '',
    spol: 'muško',
  };

  poruka: string | null = null;
  baseUrl =
    window.location.hostname === 'spider.foi.hr'
      ? 'http://spider.foi.hr:12203'
      : 'http://localhost:12222';

  constructor(private http: HttpClient) {}

  onSubmit(): void {
    this.http.post(`${this.baseUrl}/registracija`, this.korisnik).subscribe({
      next: () => {
        alert('Registracija je uspješna!');
        this.poruka = null;
      },
      error: (error) => {
        console.error('Greška pri registraciji:', error);
        this.poruka =
          'Došlo je do greške pri registraciji. Molimo pokušajte ponovno.';
      },
    });
  }
}

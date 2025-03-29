import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class ProfilComponent implements OnInit {
  korisnik: any = null;
  baseUrl: string =
    window.location.hostname === 'spider.foi.hr'
      ? 'http://spider.foi.hr:12203'
      : 'http://localhost:12222';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const korime = this.getCookie('korime');

    if (korime) {
      this.http.get(`${this.baseUrl}/servis/korisnici/${korime}`).subscribe({
        next: (data: any) => {
          this.korisnik = data;
          this.postaviNavigaciju();
        },
        error: (error) => {
          console.error('Greška pri dohvaćanju podataka:', error);
          this.korisnik = {
            error: 'Došlo je do greške pri dohvaćanju podataka.',
          };
        },
      });
    }
  }

  postaviNavigaciju(): void {
    const navigacija = document.querySelector('nav');
    if (!this.korisnik) return;

    if (this.korisnik.zahtjevZaPristup === 'Nema pristup') {
      const zahtjevContainer = document.getElementById('zahtjevContainer');
      zahtjevContainer!.style.display = 'block';

      const links = navigacija!.querySelectorAll('a');
      links.forEach((link: any) => {
        if (
          !link.href.includes('dokumentacija') &&
          !link.href.includes('profil') &&
          !link.href.includes('odjava')
        ) {
          link.style.display = 'none';
        } else {
          link.style.display = 'inline-block';
        }
      });
    }

    if (this.korisnik.zahtjevZaPristup === 'pending') {
      navigacija!.style.display = 'block';
      this.stilizirajLinkove(navigacija);
    } else if (this.korisnik.zahtjevZaPristup === 'Ima pristup') {
      this.stilizirajLinkove(navigacija);
    }
  }

  stilizirajLinkove(navigacija: Element | null): void {
    const links = navigacija!.querySelectorAll('a');
    links.forEach((link: any) => {
      link.style.color = 'white';
      link.style.textDecoration = 'none';
      link.style.margin = '0 15px';
      link.style.fontSize = '16px';
      link.style.transition = 'color 0.3s ease';
      link.addEventListener('mouseover', () => {
        link.style.color = '#00bcd4';
      });
      link.addEventListener('mouseout', () => {
        link.style.color = 'white';
      });
    });
  }

  posaljiZahtjev(): void {
    const korime = this.getCookie('korime');

    if (korime) {
      this.http
        .post(`${this.baseUrl}/servis/korisnici/${korime}/zahtjev`, {})
        .subscribe({
          next: () => {
            alert('Zahtjev za pristup je poslan!');
            this.korisnik.zahtjevZaPristup = 'pending';
          },
          error: (error) => {
            console.error('Greška pri slanju zahtjeva:', error);
          },
        });
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}

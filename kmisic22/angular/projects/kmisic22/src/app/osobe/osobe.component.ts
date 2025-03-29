import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-osobe',
  templateUrl: './osobe.component.html',
  styleUrls: ['./osobe.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class OsobeComponent implements OnInit {
  trenutnaStranica: number = 1;
  brojPoStranici: number = 10;
  osobe: any[] = [];
  apiKljuc: string = '48391313a9ca7e086f3e2d28e315060e';
  osnovniUrl: string = 'https://api.themoviedb.org/3';
  slikeUrl: string = 'https://image.tmdb.org/t/p/original';
  placeholderSlika: string =
    'https://via.placeholder.com/200x300?text=Nema+slike';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.prikaziOsobe(this.trenutnaStranica, this.brojPoStranici);
  }

  async dohvatiOsobe(stranica: number, brojPoStranici: number): Promise<any[]> {
    const straniceZaDohvat = Math.ceil(brojPoStranici / 20);
    const osobe: any[] = [];

    for (let i = 0; i < straniceZaDohvat; i++) {
      const trenutnaStranicaZaDohvat = stranica + i;
      const response: any = await this.http
        .get(
          `${this.osnovniUrl}/person/popular?language=hr-HR&page=${trenutnaStranicaZaDohvat}&api_key=${this.apiKljuc}`
        )
        .toPromise();

      osobe.push(...response.results);
    }

    return osobe.slice(0, brojPoStranici);
  }

  async prikaziOsobe(stranica: number, brojPoStranici: number): Promise<void> {
    this.osobe = await this.dohvatiOsobe(stranica, brojPoStranici);
  }

  promijeniStranicu(stranica: number): void {
    this.trenutnaStranica = stranica;
    this.prikaziOsobe(this.trenutnaStranica, this.brojPoStranici);
  }

  promijeniBrojPoStranici(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.brojPoStranici = parseInt(target.value, 10);
    this.trenutnaStranica = 1;
    this.prikaziOsobe(this.trenutnaStranica, this.brojPoStranici);
  }

  prikaziDetalje(id: number): void {
    window.location.href = `detalji?id=${id}`;
  }
}

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalji',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalji.component.html',
  styleUrls: ['./detalji.component.scss'],
})
export class DetaljiComponent implements OnInit {
  private apiKljuc: string = '48391313a9ca7e086f3e2d28e315060e';
  private osnovniUrl: string = 'https://api.themoviedb.org/3';
  public slikeUrl: string = 'https://image.tmdb.org/t/p/original';

  osobaId: string | null = null;
  detaljiOsobe: any = null;
  galerija: any[] = [];
  filmovi: any[] = [];
  filmoviStranica: number = 1;
  ucitajJos: boolean = false;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.osobaId = this.route.snapshot.paramMap.get('id');
    if (this.osobaId) {
      this.prikaziDetaljeOsobe();
      this.prikaziGalerijuOsobe();
      this.prikaziFilmoveOsobe();
    }
  }

  dohvatiDetaljeOsobe(): Promise<any> {
    return this.http
      .get(`${this.osnovniUrl}/person/${this.osobaId}?api_key=${this.apiKljuc}`)
      .toPromise();
  }

  dohvatiGalerijuOsobe(): Promise<any> {
    return this.http
      .get(
        `${this.osnovniUrl}/person/${this.osobaId}/images?api_key=${this.apiKljuc}`
      )
      .toPromise();
  }

  dohvatiFilmoveOsobe(): Promise<any> {
    return this.http
      .get(
        `${this.osnovniUrl}/person/${this.osobaId}/movie_credits?api_key=${this.apiKljuc}&page=${this.filmoviStranica}`
      )
      .toPromise();
  }

  async prikaziDetaljeOsobe(): Promise<void> {
    try {
      this.detaljiOsobe = await this.dohvatiDetaljeOsobe();
    } catch (error) {
      console.error('Greška pri dohvaćanju detalja osobe:', error);
    }
  }

  async prikaziGalerijuOsobe(): Promise<void> {
    try {
      const galerija = await this.dohvatiGalerijuOsobe();
      this.galerija = galerija.profiles || [];
    } catch (error) {
      console.error('Greška pri dohvaćanju galerije:', error);
    }
  }

  async prikaziFilmoveOsobe(): Promise<void> {
    try {
      const filmovi = await this.dohvatiFilmoveOsobe();
      this.filmovi.push(...filmovi.cast.slice(0, 20));
      this.ucitajJos = filmovi.cast.length > 20;
    } catch (error) {
      console.error('Greška pri dohvaćanju filmova:', error);
    }
  }

  async ucitajJosFilmova(): Promise<void> {
    this.filmoviStranica++;
    await this.prikaziFilmoveOsobe();
  }
}

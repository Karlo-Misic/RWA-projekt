import { Component, OnInit } from '@angular/core';
import { FilmoviService } from '../servisi/filmovi.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filmovi',
  templateUrl: './filmovi.component.html',
  styleUrls: ['./filmovi.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class FilmoviComponent implements OnInit {
  datumOd?: string;
  datumDo?: string;
  ukupnoFilmova: number = 0;
  trenutnaStranica: number = 1;
  zapisaPoStranici: number = 20;
  filmovi: { naslov: string }[] = [];
  Math = Math;

  constructor(private filmoviService: FilmoviService) {}

  ngOnInit(): void {
    this.dohvatiFilmove();
  }

  dohvatiFilmove(): void {
    this.filmoviService
      .getFilmovi(this.datumOd, this.datumDo, this.trenutnaStranica)
      .subscribe(
        (res) => {
          console.log('Dohvaćeni podaci:', res);
          this.ukupnoFilmova = res.ukupno || 0;
          this.filmovi = res.filmovi || [];
        },
        (error) => {
          console.error('Greška prilikom dohvaćanja filmova:', error);
        }
      );
  }

  promijeniStranicu(novaStranica: number): void {
    if (
      novaStranica > 0 &&
      novaStranica <= Math.ceil(this.ukupnoFilmova / this.zapisaPoStranici)
    ) {
      this.trenutnaStranica = novaStranica;
      this.dohvatiFilmove();
    }
  }

  filtrirajFilmove(): void {
    this.trenutnaStranica = 1;
    this.dohvatiFilmove();
  }
}

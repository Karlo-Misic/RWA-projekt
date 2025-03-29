import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class PrijavaComponent implements OnInit {
  korime: string = '';
  lozinka: string = '';
  poruka: string = '';
  captchaToken: string = '';
  grecaptcha: any;

  constructor(private authService: AuthService, private router: Router) {}

  async onClick(e: Event): Promise<void> {
    e.preventDefault();

    if (!this.grecaptcha) {
      console.error('reCAPTCHA nije inicijaliziran.');
      this.poruka = 'reCAPTCHA nije inicijaliziran. Pokušajte ponovo.';
      return;
    }

    try {
      const token = await this.grecaptcha.enterprise.execute(
        '6Lfc268qAAAAAEfFooq6pSI4k_Xn8aDILGoCUkxB',
        {
          action: 'LOGIN',
        }
      );
      this.captchaToken = token;
      console.log('reCAPTCHA token:', token);
    } catch (error) {
      console.error('Greška pri izvršavanju reCAPTCHA:', error);
      this.poruka = 'Greška pri validaciji reCAPTCHA. Pokušajte ponovo.';
    }
  }

  async prijaviSe(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.korime.trim() || !this.lozinka.trim()) {
      this.poruka = 'Molimo unesite korisničko ime i lozinku.';
      return;
    }

    if (!this.captchaToken) {
      this.poruka = 'Verifikacija nije uspjela. Pokušajte ponovo.';
      return;
    }

    try {
      console.log('Korisničko ime:', this.korime);

      const response = await this.authService.login(
        this.korime,
        this.lozinka,
        this.captchaToken
      );

      localStorage.setItem('korime', response.korime);
      localStorage.setItem('uloga', response.uloga);
      this.router.navigate(['/profil']);
    } catch (error) {
      console.error('Greška pri prijavi:', error);
    }
  }

  ngOnInit(): void {
    if (typeof (window as any)['grecaptcha'] === 'undefined') {
      console.error('reCAPTCHA skripta nije učitana.');
      this.poruka = 'reCAPTCHA skripta nije učitana. Osvežite stranicu.';
      return;
    }

    this.grecaptcha = (window as any)['grecaptcha'];
    console.log('reCAPTCHA skripta je spremna.');
  }
}

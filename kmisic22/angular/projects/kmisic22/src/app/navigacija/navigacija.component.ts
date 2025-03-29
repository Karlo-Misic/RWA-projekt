import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigacija',
  templateUrl: './navigacija.component.html',
  styleUrls: ['./navigacija.component.scss'],
  standalone: false,
})
export class NavigacijaComponent {
  constructor(private router: Router) {}

  odjaviSe(): void {
    localStorage.removeItem('korisnik');
    this.router.navigate(['/prijava']);
  }
}

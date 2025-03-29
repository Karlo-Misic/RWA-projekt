import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DokumentacijaComponent } from './dokumentacija/dokumentacija.component';
import { AdminComponent } from './admin/admin.component';
import { DetaljiComponent } from './detalji/detalji.component';
import { CommonModule } from '@angular/common';
import { DodavanjeOsobaComponent } from './dodavanje-osoba/dodavanje-osoba.component';
import { FormsModule } from '@angular/forms';
import { OsobeComponent } from './osobe/osobe.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { ProfilComponent } from './profil/profil.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { NavigacijaComponent } from './navigacija/navigacija.component';
import { SlikeComponent } from './slike/slike.component';
import { FilmoviComponent } from './filmovi/filmovi.component';

const routes: Routes = [
  { path: '', redirectTo: '/prijava', pathMatch: 'full' },
  { path: 'prijava', component: PrijavaComponent },
  { path: 'registracija', component: RegistracijaComponent },
  { path: 'profil', component: ProfilComponent },
  { path: 'osobe', component: OsobeComponent },
  { path: 'detalji', component: DetaljiComponent },
  { path: 'dodavanjeOsoba', component: DodavanjeOsobaComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'dokumentacija', component: DokumentacijaComponent },
  { path: 'slike', component: SlikeComponent },
  { path: 'filmovi', component: FilmoviComponent },
];

@NgModule({
  declarations: [AppComponent, DokumentacijaComponent, NavigacijaComponent],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    AdminComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:12222'; // Zamenite sa vašim `apiUrl`

  constructor() {}

  async login(
    korime: string,
    lozinka: string,
    captchaToken?: string
  ): Promise<any> {
    const url = `${this.apiUrl}/servis/korisnici/${korime}/prijava`;
    console.log('URL za prijavu:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lozinka }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.greska || 'Greška pri prijavi.');
      }

      return await response.json();
    } catch (error) {
      console.error('Greška pri prijavi:', error);
      throw error;
    }
  }

  async register(data: any): Promise<any> {
    const url = `${this.apiUrl}/servis/korisnici`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.greska || 'Greška pri registraciji.');
      }

      return await response.json();
    } catch (error) {
      console.error('Greška pri registraciji:', error);
      throw error;
    }
  }

  async logout(): Promise<any> {
    const url = `${this.apiUrl}/odjava`;

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.greska || 'Greška pri odjavi.');
      }

      return await response.json();
    } catch (error) {
      console.error('Greška pri odjavi:', error);
      throw error;
    }
  }
}

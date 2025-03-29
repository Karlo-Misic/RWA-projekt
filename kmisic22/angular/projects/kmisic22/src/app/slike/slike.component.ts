import { Component, OnInit } from '@angular/core';
import { SlikeService } from '../servisi/slike.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slike',
  templateUrl: './slike.component.html',
  styleUrls: ['./slike.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class SlikeComponent implements OnInit {
  selectedFile: File | null = null;
  images: string[] = [];
  isLoading = false;

  constructor(private slikeService: SlikeService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Odabrana datoteka:', this.selectedFile);
    } else {
      console.error('Nije odabrana nijedna datoteka.');
    }
  }

  uploadImage(): void {
    if (this.selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(this.selectedFile.type)) {
        alert('Odaberite ispravnu sliku (JPEG, PNG, GIF).');
        return;
      }

      if (this.selectedFile.size > 5 * 1024 * 1024) {
        alert('Datoteka je prevelika (maksimalna veličina 5 MB).');
        return;
      }

      this.isLoading = true;
      this.slikeService.uploadImage(this.selectedFile).subscribe({
        next: () => {
          this.isLoading = false;
          this.loadImages();
          alert('Slika uspješno učitana!');
        },
        error: () => {
          this.isLoading = false;
          alert('Greška pri učitavanju slike.');
        },
      });
    } else {
      alert('Molimo odaberite sliku prije učitavanja.');
    }
  }

  loadImages(): void {
    this.slikeService.getFolderImages().subscribe({
      next: (images) => {
        this.images = images.map(
          (image) => `http://localhost:12222/uploads/${image}`
        );
      },
      error: () => {
        alert('Greška pri dohvaćanju slika.');
      },
    });
  }
}

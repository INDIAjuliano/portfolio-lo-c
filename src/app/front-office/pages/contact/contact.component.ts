import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  name = '';
  email = '';
  phone = '';
  message = '';
  isSubmitting = false;
  submitMessage: string | null = null;
  submitError: string | null = null;

  constructor(private apiService: ApiService) {}

  onSubmit(): void {
    if (!this.name || !this.email || !this.message) {
      this.submitError = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = null;
    this.submitError = null;

    this.apiService.createContact({
      name: this.name,
      email: this.email,
      phone: this.phone,
      message: this.message
    }).subscribe({
      next: () => {
        this.submitMessage = 'Votre message a été envoyé avec succès !';
        this.name = '';
        this.email = '';
        this.phone = '';
        this.message = '';
        this.isSubmitting = false;
        setTimeout(() => {
          this.submitMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Contact form error', err);
        this.submitError = 'Erreur lors de l\'envoi du message. Veuillez réessayer.';
        this.isSubmitting = false;
      }
    });
  }
}

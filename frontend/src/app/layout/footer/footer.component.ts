import { Component } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { CONTACTS } from '../../core/config/contacts';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  readonly contacts = CONTACTS;
  readonly year = new Date().getFullYear();

  readonly phoneHref = `tel:${CONTACTS.phone.replace(/\s+/g, '')}`;
  readonly instagramHref = `https://instagram.com/${CONTACTS.instagram}`;
  readonly emailHref = `mailto:${CONTACTS.email}`;
}

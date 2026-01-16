import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: string | Date | undefined): string {
    if (!value) return '';

    const now = new Date();

    const created = new Date(value);

    if (isNaN(created.getTime())) return '';

    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 30) return `${diffDays} jours`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;

    const years = Math.floor(diffDays / 365);
    return `${years} an${years > 1?'s': ''}`; // au cas où c au pluriel
  }

}

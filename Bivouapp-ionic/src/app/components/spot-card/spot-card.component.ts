import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Spot } from '../../models/spot.model';
import { SpotsService } from '../../services/spots';

@Component({
  selector: 'app-spot-card',
  templateUrl: './spot-card.component.html',
  styleUrls: ['./spot-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class SpotCardComponent {

  // Le spot à afficher (obligatoire)
  @Input() spot!: Spot;

  // Si on est sur la page favoris, on peut supprimer
  @Input() isFavoritePage: boolean = false;

  // Event quand on enlève un favori
  @Output() removed = new EventEmitter<number>();

  constructor(private spotsService: SpotsService) {}

  onFavoriteClick(event: Event) {
    // stopPropagation empêche de naviguer vers le détail quand on clique sur le coeur
    event.stopPropagation();
    event.preventDefault();

    // On change l'état favori du spot
    this.spotsService.toggleFavorite(this.spot.id);
    this.spot.isFavorite = !this.spot.isFavorite;

    // Si on est sur la page des favoris ET que le spot n'est plus favori
    // on prévient le parent pour qu'il le retire de la liste
    if (this.isFavoritePage && !this.spot.isFavorite) {
      this.removed.emit(this.spot.id);
    }
  }
}

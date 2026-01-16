import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Spot } from '../../models/spot.model';

@Component({
  selector: 'app-spot-card',
  templateUrl: './spot-card.component.html',
  styleUrls: ['./spot-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SpotCardComponent {

  @Input() spot!: Spot;
  @Output() clicked = new EventEmitter<void>();
  @Output() favoriteToggled = new EventEmitter<void>();

  constructor() { }

  onCardClick() {
    this.clicked.emit();
  }

  onToggleFavorite(event: Event) {
    event.stopPropagation();

    // pour changer directement on prévient l'event du parent
    this.favoriteToggled.emit();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Spot, Service } from '../models/spot.model';
import { SpotsService } from '../services/spots';
import * as L from 'leaflet';

@Component({
  selector: 'app-spot-detail',
  templateUrl: './spot-detail.page.html',
  styleUrls: ['./spot-detail.page.scss'],
  standalone: false,
})
export class SpotDetailPage implements OnInit, OnDestroy {

  spot?: Spot;
  allServices: Service[] = [];
  showMap = true;
  map: L.Map | undefined;

  constructor(
    private route: ActivatedRoute,
    private spotsService: SpotsService
  ) {}

  ngOnInit() {
    // on récupère l'id dans l'url pour savoir quel spot afficher
    const spotId = Number(this.route.snapshot.paramMap.get('id'));

    if (spotId) {
      this.loadSpot(spotId);
    }
    // on charge la liste des services
    this.allServices = this.spotsService.getAllServices();
  }

  // quand on quitte la page on détruit la carte
  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadSpot(id: number) {
    this.spotsService.getSpotById(id).subscribe({
      next: (spot) => {
        this.spot = spot;

        // si la carte doit être affichée on attend que le html soit là
        if (this.showMap) {
          setTimeout(() => {
            this.loadMap();
          }, 100);
        }
      },
      error: (err) => console.error(err)
    });
  }

  // pour switcher le petit coeur des favoris
  toggleFavorite() {
    if (this.spot) {
      this.spotsService.toggleFavorite(this.spot.id);
    }
  }

  // récupère le nom du service
  getServiceLabel(serviceId: string): string {
    const service = this.allServices.find(s => s.id === serviceId);
    return service?.label || serviceId;
  }

  // récupère l'icône ionic correspondante au service
  getServiceIcon(serviceId: string): string {
    const service = this.allServices.find(s => s.id === serviceId);
    return service?.icon || 'help-circle-outline';
  }

  // pour afficher ou cacher la carte quand on clique sur le bouton
  toggleMap() {
    this.showMap = !this.showMap;

    if (this.showMap) {
      setTimeout(() => {
        this.loadMap();
        // on force la carte à se redimensionner sinon elle s'affiche mal
        this.map?.invalidateSize();
      }, 100);
    }
  }

  // initialisation de la mini carte leaflet
  loadMap() {
    if (!this.spot) return;

    // on nettoie l'ancienne carte si elle existe
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }

    // on crée la carte centrée sur le spot
    this.map = L.map('mini-map', {
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
    }).setView([this.spot.latitude, this.spot.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    // gros rond bleu transparent
    L.circleMarker([this.spot.latitude, this.spot.longitude], {
      color: '#2f65e8',
      fillColor: '#2f65e8',
      fillOpacity: 0.5,
      radius: 20
    }).addTo(this.map);

    // et un point blanc au milieu
    L.circleMarker([this.spot.latitude, this.spot.longitude], {
      color: '#fff',
      fillColor: '#fff',
      fillOpacity: 1,
      radius: 5
    }).addTo(this.map);
  }
}

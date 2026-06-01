import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
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

  @Input() spotId?:number;
  @Output() closed = new EventEmitter<void>();
  spot?: Spot;
  allServices: Service[] = [];
  showMap = false;
  map: L.Map | undefined;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private spotsService: SpotsService
  ) {}

  ngOnInit() {
    // 1. On charge d'abord la liste des services (communs aux deux cas)
    this.allServices = this.spotsService.getAllServices();

    // 2. On regarde si on a reçu l'ID par l'Input (Cas du volet sur la carte)
    if (this.spotId) {
      this.loadSpot(this.spotId);
    }
    // 3. Sinon, on va le chercher dans l'URL (Cas de la page seule)
    else {
      const urlId = Number(this.route.snapshot.paramMap.get('id'));
      if (urlId) {
        this.loadSpot(urlId);
      }
    }
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
  closeSheet(){
    this.closed.emit();

  }

  onCarouselScroll(event: any) {
    const container = event.target;
    this.currentImageIndex = Math.round(container.scrollLeft / container.clientWidth);
  }
}

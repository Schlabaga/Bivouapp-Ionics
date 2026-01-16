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
    const spotId = Number(this.route.snapshot.paramMap.get('id'));

    if (spotId) {
      this.loadSpot(spotId);
    }
    this.allServices = this.spotsService.getAllServices();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadSpot(id: number) {
    this.spotsService.getSpotById(id).subscribe({
      next: (spot) => {
        this.spot = spot;

        if (this.showMap) {
          setTimeout(() => {
            this.loadMap();
          }, 100); // délai pour être sûr que le HTML est prêt
        }
      },
      error: (err) => console.error(err)
    });
  }

  toggleFavorite() {
    if (this.spot) {
      this.spotsService.toggleFavorite(this.spot.id);
      this.spot.isFavorite = !this.spot.isFavorite;
    }
  }

  getServiceLabel(serviceId: string): string {
    const service = this.allServices.find(s => s.id === serviceId);
    return service?.label || serviceId;
  }

  getServiceIcon(serviceId: string): string {
    const service = this.allServices.find(s => s.id === serviceId);
    return service?.icon || 'help-circle-outline';
  }

  toggleMap() {
    this.showMap = !this.showMap;

    if (this.showMap) {
      setTimeout(() => {
        this.loadMap();
        this.map?.invalidateSize();
      }, 100);
    }
  }

  loadMap() {
    if (!this.spot) return;

    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }

    this.map = L.map('mini-map', {
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
    }).setView([this.spot.latitude, this.spot.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    L.circleMarker([this.spot.latitude, this.spot.longitude], {
      color: '#2f65e8',
      fillColor: '#2f65e8',
      fillOpacity: 0.5,
      radius: 20
    }).addTo(this.map);

    L.circleMarker([this.spot.latitude, this.spot.longitude], {
      color: '#fff',
      fillColor: '#fff',
      fillOpacity: 1,
      radius: 5
    }).addTo(this.map);
  }
}

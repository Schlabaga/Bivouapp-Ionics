import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonModal, AlertController } from '@ionic/angular';
import { Router, RouterModule} from '@angular/router';
import { Spot } from '../models/spot.model';
import { SupabaseService } from '../services/supabase';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import {SpotDetailPageModule} from "../spot-detail/spot-detail.module";

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, SpotDetailPageModule]
})
export class MapPage implements OnInit {
  allSpots: Spot[] = [];
  latitude = 0;
  longitude = 0;
  map!: L.Map;
  searchQuery = '';
  selectedSort = 'all';
  isModalOpen = true;
  maxDistance = 25;
  markerLayer: L.Marker[] = [];
  selectedSpot: Spot | null = null;

  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild('filterModal') filterModal!: IonModal;

  customIcon = L.icon({
    iconUrl: 'assets/icon/pin.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  servicesFilters = [
    { id: 'water',   label: "Point d'eau", icon: 'water-outline',    checked: false },
    { id: 'shower',  label: "Douche",      icon: 'sparkles-outline', checked: false },
    { id: 'toilets', label: 'Toilettes',   icon: 'man-outline',      checked: false },
    { id: 'shelter', label: 'Abri',        icon: 'home-outline',     checked: false },
  ];

  sortOptions = [
    { id: 'all',     label: 'Tout',        icon: 'grid-outline' },
    { id: 'nearby',  label: 'Près de moi', icon: 'locate-outline' },
    { id: 'bivouac', label: 'Bivouac',     icon: 'flame-outline' },
    { id: 'water',   label: "Point d'eau", icon: 'water-outline' },
    { id: 'shower',  label: "Douche",      icon: 'sparkles-outline' },
    { id: 'toilets', label: 'Toilettes',   icon: 'man-outline' },
    { id: 'shelter', label: 'Abri',        icon: 'home-outline' },
  ];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  async ionViewDidEnter() {
    this.isModalOpen = true;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    await this.getCurrentPosition();

    this.map = L.map('map', {
      zoomControl: false
    }).setView([this.latitude, this.longitude], 13);

    this.map.on('click', () => {
      if (this.modal) {
        this.modal.setCurrentBreakpoint(0.20);
      }
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    await this.loadSpots();
  }

  async ionViewWillLeave() {
    this.isModalOpen = false;
    this.selectedSpot = null;
  }

  async goBack() {
    this.isModalOpen = false;
    setTimeout(() => {
      this.router.navigateByUrl('/tabs/explore');
    }, 150);
  }

  async getCurrentPosition() {
    try {
      const coords = await Geolocation.getCurrentPosition();
      this.latitude = coords.coords.latitude;
      this.longitude = coords.coords.longitude;
    } catch {
      const alert = await this.alertController.create({
        header: 'Géolocalisation requise',
        message: 'Active la localisation pour voir les spots près de toi.',
        buttons: ['OK']
      });
      await alert.present();
      this.latitude = 43.2964;
      this.longitude = 5.3697;
    }
  }

  private getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  applyFilters() {
    let filtered = [...this.allSpots];

    // Filtre par type (chip)
    const typeChips = ['bivouac', 'water', 'shower', 'toilets', 'shelter'];
    if (typeChips.includes(this.selectedSort)) {
      filtered = filtered.filter(s => s.type?.toLowerCase() === this.selectedSort);
      console.log(filtered)
    }

    // Filtre par distance
    filtered = filtered.filter(s => {
      const dist = this.getDistanceKm(this.latitude, this.longitude, s.latitude, s.longitude);
      return dist <= this.maxDistance;
    });

    // Filtre par services cochés
    const activeServices = this.servicesFilters.filter(s => s.checked).map(s => s.id);
    if (activeServices.length > 0) {
      filtered = filtered.filter(spot =>
        activeServices.every(serviceId =>
          spot.spot_services?.some(ss => ss.service_id === serviceId)
        )
      );
    }

    this.displaySpotsOnMap(filtered);
  }

  get activeFilterCount(): number {
    return this.servicesFilters.filter(s => s.checked).length;
  }

  openFilterSheet() {
    this.filterModal.present();
  }

  applyFiltersAndClose() {
    this.applyFilters();
    this.filterModal.dismiss();
  }

  resetFilters() {
    this.maxDistance = 25;
    this.servicesFilters.forEach(s => s.checked = false);
    this.applyFilters();
    this.filterModal.dismiss();
  }

  async loadSpots() {
    try {
      this.allSpots = await this.supabaseService.getSpots() || [];
      this.displaySpotsOnMap(this.allSpots);
    } catch (err) {
      console.error(err);
    }
  }

  selectSort(id: string) {
    this.selectedSort = id;
    this.applyFilters();
  }

  onSearch(event: any) {
    console.log('Search:', this.searchQuery);
  }

  displaySpotsOnMap(spotsToDisplay: Spot[]) {
    this.markerLayer.forEach(marker => marker.remove());
    this.markerLayer = [];

    spotsToDisplay.forEach(spot => {
      const marker = new L.Marker([spot.latitude, spot.longitude], { icon: this.customIcon });

      marker.on('click', () => {
        this.selectedSpot = spot;
        this.maximizeModal();
      });

      marker.addTo(this.map);
      this.markerLayer.push(marker);
    });
  }

  closeSpotDetail() {
    this.selectedSpot = null;
    this.modal.setCurrentBreakpoint(0.20);
  }

  maximizeModal() {
    if (this.modal) {
      this.modal.setCurrentBreakpoint(0.92);
    }
  }

  checkDismiss = async () => {
    if (this.modal) {
      await this.modal.setCurrentBreakpoint(0.20);
    }
    return false;
  };
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonModal } from '@ionic/angular';
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
  isModalOpen=true;
  maxDistance = 25; // Distance par défaut en km
  markerLayer: L.Marker[] = [];
  selectedSpot: Spot | null = null;

  // On récupère le premier ion-modal trouvé dans le HTML
  @ViewChild(IonModal) modal!: IonModal;

  customIcon = L.icon({
    iconUrl: 'assets/icon/pin.png', // Ou le chemin vers une image de pin
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  servicesFilters = [
    { id: 'water',    label: "Point d'eau", icon: 'water-outline',    checked: false },
    { id: 'shower',   label: "Douche",      icon: 'sparkles-outline', checked: false },
    { id: 'toilets',  label: 'Toilettes',   icon: 'man-outline',      checked: false },
    { id: 'shelter',  label: 'Abri',        icon: 'home-outline',     checked: false },
  ];




  // TODO: adapter les actions selon les besoins
  sortOptions = [
    { id: 'all',      label: 'Tout',        icon: 'grid-outline' },
    { id: 'nearby',   label: 'Près de moi', icon: 'locate-outline' },
    // { id: 'top',   label: 'Les mieux notés', icon: 'star-outline' },
    // { id: 'free',  label: 'Gratuit',     icon: 'pricetag-outline' },
    { id: 'bivouac',  label: 'Bivouac',     icon: 'flame-outline' },
    { id: 'water',    label: "Point d'eau", icon: 'water-outline' },
    { id: 'shower',   label: "Douche",      icon: 'sparkles-outline' },
    { id: 'toilets',  label: 'Toilettes',   icon: 'man-outline' },
    { id: 'shelter',  label: 'Abri',        icon: 'home-outline' },
  ];

  constructor(private supabaseService: SupabaseService,
              private router: Router) {}

  ngOnInit() {}



  async ionViewDidEnter() {
    // On force le modal à se rouvrir dès qu'on revient sur la page !
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

  async ionViewWillLeave(){
    this.isModalOpen=false;
    this.selectedSpot= null;
  }

  async goBack(){
    this.isModalOpen=false;

    setTimeout(()=>{
      this.router.navigateByUrl('/tabs/explore');
    },150);
  }

  applyFilters() {
    console.log('Distance max:', this.maxDistance);
    console.log('Services cochés:', this.servicesFilters.filter(s => s.checked));

    // TODO: C'est ici que tu vas filtrer ton tableau "this.allSpots"
    // en calculant la distance entre (this.latitude, this.longitude) et les coordonnées du spot,
    // et en vérifiant les services requis !
  }
  async getCurrentPosition() {
    try {
      const coords = await Geolocation.getCurrentPosition();
      this.latitude = coords.coords.latitude;
      this.longitude = coords.coords.longitude;
    } catch {
      this.latitude = 43.2964;
      this.longitude = 5.3697;
    }
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

    this.allSpots.filter(spot =>{
      return spot.type === id;
    })
    // TODO: filtrer les marqueurs sur la carte selon l'option
  }

  onSearch(event: any) {
    // TODO: geocoding ou filtrage local
    console.log('Search:', this.searchQuery);
  }

  async loadSpotTypesFromSupabase(){
    this.supabaseService
  }

  displaySpotsOnMap(spotsToDisplay: Spot[]){
    this.markerLayer.forEach(marker => marker.remove());
    this.markerLayer = [];

    spotsToDisplay.forEach(spot => {
      const marker = new L.Marker([spot.latitude, spot.longitude],{ icon: this.customIcon })

      marker.on("click", ()=> {
        this.selectedSpot= spot;
        this.maximizeModal();
      });

      marker.addTo(this.map);
      this.markerLayer.push(marker);
    })
  }

  closeSpotDetail(){
    this.selectedSpot=null;
    this.modal.setCurrentBreakpoint(0.20)
  }

  maximizeModal(){
    if(this.modal){
      this.modal.setCurrentBreakpoint(0.92);
    }
  }

  checkDismiss = async () => {
    if (this.modal) {
      // 1. On force le modal à redescendre au breakpoint minimum (0.20)
      await this.modal.setCurrentBreakpoint(0.20);
    }

    // 2. TRÈS IMPORTANT : On renvoie false pour dire au modal "Ne te ferme pas !"
    return false;
  };

}

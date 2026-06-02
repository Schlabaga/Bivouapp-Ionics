// src/app/publish/publish.page.ts
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { SpotsService } from '../services/spots';
import { Lodging, Service } from '../models/spot.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.page.html',
  styleUrls: ['./publish.page.scss'],
  standalone: false,
})
export class PublishPage implements OnDestroy {

  spotForm!: FormGroup;
  allServices: Service[] = [];
  allLodging: Lodging[] = [];
  map: L.Map | null = null;
  marker: L.Marker | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private spotsService: SpotsService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.initForm();
  }

  initForm() {
    this.allServices = this.spotsService.getAllServices();
    this.allLodging = this.spotsService.getAllLodging();

    this.spotForm = this.formBuilder.group({
      title: [''], // Optionnel, géré au submit si vide
      description: ['', [Validators.required]], // Toujours requis !
      type: ['bivouac', [Validators.required]], // On met par défaut l'ID 'bivouac' qui est dans ton tableau propre
      longitude: [6.6300, [Validators.required]],
      latitude: [45.9366, [Validators.required]],
      rating: [4],
      accessibleByTrain: [false],
      isPaid: [false],
      price: [null], // Validé dynamiquement si isPaid passe à true
      isForbiddenZone: [false],
      services: [[]],
      imageUrl: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600'],
      location: ['Spot inconnu'],
      isFavorite: false
    });
  }

  ionViewDidEnter() {
    this.initMap();
  }

  ionViewDidLeave() {
    this.destroyMap();
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  initMap() {
    this.destroyMap();

    const defaultLat = this.spotForm.get('latitude')?.value || 45.9366;
    const defaultLng = this.spotForm.get('longitude')?.value || 6.6300;

    this.map = L.map('map-publish', {
      zoomControl: false
    }).setView([defaultLat, defaultLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl: 'assets/icon/favicon.png',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    this.marker = L.marker([defaultLat, defaultLng], {
      icon: icon,
      draggable: true
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      if (this.marker) {
        const position = this.marker.getLatLng();
        this.updateCoordinates(position.lat, position.lng);
      }
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
        this.updateCoordinates(e.latlng.lat, e.latlng.lng);
      }
    });
  }

  // Capte la position GPS actuelle du smartphone
  async getCurrentLocation() {
    if (!navigator.geolocation) {
      this.showToast("La géolocalisation n'est pas supportée par ton tel mon frate.", 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Recherche de ton signal GPS...',
      spinner: 'crescent'
    });
    await loading.present();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.updateCoordinates(lat, lng);

        if (this.map && this.marker) {
          this.marker.setLatLng([lat, lng]);
          this.map.setView([lat, lng], 15);
        }
        loading.dismiss();
      },
      (error) => {
        console.error(error);
        loading.dismiss();
        this.showToast("Impossible de choper ta position, vérifie tes autorisations !", 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Active/Désactive la validation du prix selon si c'est payant
  onPaidToggleChange(event: any) {
    const isPaid = event.detail.checked;
    const priceControl = this.spotForm.get('price');

    if (isPaid) {
      priceControl?.setValidators([Validators.required, Validators.min(0.1)]);
    } else {
      priceControl?.clearValidators();
      priceControl?.setValue(null);
    }
    priceControl?.updateValueAndValidity();
  }

  destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  updateCoordinates(lat: number, lng: number) {
    this.spotForm.patchValue({
      latitude: lat,
      longitude: lng
    });
  }

  setRating(rating: number) {
    this.spotForm.get('rating')?.setValue(rating);
  }

  // === GESTION DES LOGDINGS (Sélection unique) ===
  selectLodging(lodgingId: string): void {
    this.spotForm.get('type')?.setValue(lodgingId);
  }

  isLodgingSelected(lodgingId: string): boolean {
    return this.spotForm.get('type')?.value === lodgingId;
  }

  // === GESTION DES SERVICES (Sélection multiple) ===
  isServiceSelected(serviceId: string): boolean {
    const services = this.spotForm.get('services')?.value || [];
    return services.includes(serviceId);
  }

  toggleService(serviceId: string): void {
    const currentServices = [...(this.spotForm.get('services')?.value || [])];
    const index = currentServices.indexOf(serviceId);
    if (index > -1) {
      currentServices.splice(index, 1);
    } else {
      currentServices.push(serviceId);
    }
    this.spotForm.get('services')?.setValue(currentServices);
  }

  async onSubmit() {
    if (this.spotForm.invalid) {
      this.showToast('Il manque des informations obligatoires (description ou coordonnées) !', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Enregistrement du spot...',
      spinner: 'crescent'
    });
    await loading.present();

    const photoUrls = [this.spotForm.value.imageUrl];
    const serviceIds = this.spotForm.get('services')?.value || [];

    // Récupère l'étiquette (Label) propre pour faire un titre automatique si l'utilisateur n'en met pas
    const selectedLodging = this.allLodging.find(l => l.id === this.spotForm.value.type);
    const typeLabel = selectedLodging ? selectedLodging.label : 'Spot Nature';
    const finalTitle = this.spotForm.value.title?.trim() || `${typeLabel} inédit`;

    // Prépare l'objet propre pour l'API Supabase
    const spotData: Partial<any> = {
      title: finalTitle,
      description: this.spotForm.value.description,
      type: this.spotForm.value.type, // Enverra par exemple 'alpine_hut', match parfait avec ton enum et la BDD SQL !
      latitude: this.spotForm.value.latitude,
      longitude: this.spotForm.value.longitude,
      rating: this.spotForm.value.rating,
      location: this.spotForm.value.location,
      price: this.spotForm.value.isPaid ? this.spotForm.value.price : 0
    };

    try {
      // Envoi des données cleans à Supabase
      await this.spotsService.addSpot(spotData, photoUrls, serviceIds);

      loading.dismiss();
      await this.showToast('Le spot est partagé avec la commu, parfait !', 'success');

      // Reset total
      this.spotForm.reset({
        title: '',
        description: '',
        type: 'bivouac',
        latitude: 45.9366,
        longitude: 6.6300,
        rating: 4,
        accessibleByTrain: false,
        isPaid: false,
        price: null,
        isForbiddenZone: false,
        services: [],
        imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600',
        location: 'Spot inconnu',
        isFavorite: false
      });

      await this.router.navigate(['/tabs/explore']);
    } catch (error) {
      console.error(error);
      await loading.dismiss();
      await this.showToast("Erreur système lors de la publication... C'est le oai !", 'danger');
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}

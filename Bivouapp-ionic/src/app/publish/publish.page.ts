// src/app/publish/publish.page.ts
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { SpotsService } from '../services/spots';
import { Lodging, Service } from '../models/spot.model';
import * as L from 'leaflet';
import { Camera } from '@capacitor/camera';
import {NavController} from "@ionic/angular";



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
  selectedImage: string | undefined;
  imagesUrl: String[] =[];

  constructor(
    private formBuilder: FormBuilder,
    private spotsService: SpotsService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private navCtrl: NavController

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
      imagesUrl: [[]],
      location: ['Spot inconnu'],
      isFavorite: false
    });
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.initMap();
    }, 50);
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

    // Sécurité : On vérifie si l'élément existe bien dans le DOM avant d'init
    const mapEl = document.getElementById('map-publish');
    if (!mapEl) return;

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

    // CORRECTION ICI : On récupère ton vrai tableau d'images (imagesUrl) au lieu d'un champ inexistant
    const photoUrls = this.spotForm.get('imagesUrl')?.value || [];
    const serviceIds = this.spotForm.get('services')?.value || [];

    const selectedLodging = this.allLodging.find(l => l.id === this.spotForm.value.type);
    const typeLabel = selectedLodging ? selectedLodging.label : 'Spot Nature';
    const finalTitle = this.spotForm.value.title?.trim() || `${typeLabel} inédit`;

    const spotData: Partial<any> = {
      title: finalTitle,
      description: this.spotForm.value.description,
      type: this.spotForm.value.type,
      latitude: this.spotForm.value.latitude,
      longitude: this.spotForm.value.longitude,
      rating: this.spotForm.value.rating,
      location: this.spotForm.value.location,
      price: this.spotForm.value.isPaid ? this.spotForm.value.price : 0
    };

    try {
      await this.spotsService.addSpot(spotData, photoUrls, serviceIds);

      loading.dismiss();
      await this.showToast('Le spot est partagé avec la commu, parfait !', 'success');

      // Reset clean
      this.imagesUrl = []; // On vide aussi la variable locale !
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
        imagesUrl: [],
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
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'uri' as any,
        source: undefined
      });

      if (image.webPath) {
        // 1. On ajoute la nouvelle photo dans ton tableau de classe pour l'affichage HTML
        this.imagesUrl.push(image.webPath);

        // 2. On met à jour le formulaire avec le tableau complet des images
        this.spotForm.patchValue({
          imagesUrl: [...this.imagesUrl]
        });
      }
    } catch (error) {
      console.log("L'utilisateur a annulé la capture :", error);
    }
  }
  removePhoto(imgUrl: String, event: Event) {
    event.stopPropagation(); // Évite de déclencher le clic du parent

    // On filtre le tableau pour enlever l'image
    this.imagesUrl = this.imagesUrl.filter(url => url !== imgUrl);

    // On met à jour le formulaire
    this.spotForm.patchValue({
      imagesUrl: [...this.imagesUrl]
    });
  }
  goBack(){
    this.navCtrl.back();
  }
}

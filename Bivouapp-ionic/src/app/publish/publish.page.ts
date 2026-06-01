import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SpotsService } from '../services/spots';
import { Service } from '../models/spot.model';
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
  map: L.Map | null = null;
  marker: L.Marker | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private spotsService: SpotsService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.initForm();
  }

  initForm() {
    this.allServices = this.spotsService.getAllServices();

    this.spotForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      location: ['Spot inconnu'],
      longitude: [6.6300, [Validators.required]],
      latitude: [45.9366, [Validators.required]],
      rating: [4],
      price: [null],
      services: [[]], // Contiendra le tableau des IDs sélectionnés
      imageUrl: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600'],
      type: 'bivouac',
      isFavorite: false
    });
  }

  // Se déclenche à chaque fois qu'on entre sur la vue
  ionViewDidEnter() {
    this.initMap();
  }

  // Nettoyage si on quitte la vue sans détruire le composant
  ionViewDidLeave() {
    this.destroyMap();
  }

  // Sécurité ultime : destruction au démontage du composant
  ngOnDestroy() {
    this.destroyMap();
  }

  initMap() {
    // Si la carte existe déjà, on la vire pour éviter les conflits d'ID dans le DOM
    this.destroyMap();

    const defaultLat = this.spotForm.get('latitude')?.value || 45.9366;
    const defaultLng = this.spotForm.get('longitude')?.value || 6.6300;

    // Initialisation de la map Leaflet
    this.map = L.map('map-publish', {
      zoomControl: false
    }).setView([defaultLat, defaultLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    // Icône personnalisée standardisée
    const icon = L.icon({
      iconUrl: 'assets/icon/favicon.png',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Création du marqueur déplaçable
    this.marker = L.marker([defaultLat, defaultLng], {
      icon: icon,
      draggable: true
    }).addTo(this.map);

    // Écouteur de fin de déplacement du marqueur
    this.marker.on('dragend', () => {
      if (this.marker) {
        const position = this.marker.getLatLng();
        this.updateCoordinates(position.lat, position.lng);
      }
    });

    // Bonus : On peut aussi cliquer sur la carte pour déplacer le marqueur d'un coup
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
        this.updateCoordinates(e.latlng.lat, e.latlng.lng);
      }
    });
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

  isServiceSelected(serviceId: string): boolean {
    const services = this.spotForm.get('services')?.value || [];
    return services.includes(serviceId);
  }

  toggleService(serviceId: string): void {
    // On récupère une copie propre (on ne mute pas directement le tableau d'origine)
    const currentServices = [...(this.spotForm.get('services')?.value || [])];

    const index = currentServices.indexOf(serviceId);
    if (index > -1) {
      currentServices.splice(index, 1); // On le retire s'il y était
    } else {
      currentServices.push(serviceId); // On l'ajoute s'il n'y était pas
    }

    // On met à jour le formulaire avec la nouvelle référence du tableau
    this.spotForm.get('services')?.setValue(currentServices);
  }

  async onSubmit() {
    if (this.spotForm.invalid) {
      const toast = await this.toastController.create({
        message: 'Il manque des infos, mon frate ! Vérifie le titre et la description.',
        duration: 2500,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const photoUrls = ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600'];
    const serviceIds = this.spotForm.get('services')?.value || [];

    const newSpot = {
      ...this.spotForm.value,
      id: Date.now(),
      distance: 0,
      price: this.spotForm.value.price || 0
    };

    try {
      // Envoi au service
      await this.spotsService.addSpot(newSpot, photoUrls, serviceIds);

      const toast = await this.toastController.create({
        message: 'Le spot est en ligne, magnifique !',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();

      // Reset propre du formulaire et redirection
      this.spotForm.reset({
        latitude: 45.9366,
        longitude: 6.6300,
        rating: 4,
        price: null,
        services: [],
        imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600',
        type: 'bivouac',
        isFavorite: false
      });

      await this.router.navigate(['/tabs/explore']);
    } catch (error) {
      console.error(error);
      const errorToast = await this.toastController.create({
        message: "Erreur lors de la publication... C'est le oai !",
        duration: 2000,
        color: 'danger'
      });
      await errorToast.present();
    }
  }
}

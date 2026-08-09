// src/app/publish/publish.page.ts
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { SpotsService } from '../services/spots';
import {
  Lodging, Service,
  WaterAvailabilityOption, LegalStatusOption, GroundTypeOption, NetworkCoverageOption
} from '../models/spot.model';
import * as L from 'leaflet';
import { Camera } from '@capacitor/camera';
import {NavController} from "@ionic/angular";
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import {environment} from "../../environment/environment";



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
  allWaterOptions: WaterAvailabilityOption[] = [];
  allLegalOptions: LegalStatusOption[] = [];
  allGroundOptions: GroundTypeOption[] = [];
  allNetworkOptions: NetworkCoverageOption[] = [];
  map: L.Map | null = null;
  marker: L.Marker | null = null;
  selectedImage: string | undefined;
  imagesUrl: String[] =[];
  searchResults:any[] =[];

  // === WIZARD MULTI-ÉCRANS ===
  // On découpe le gros formulaire en petites étapes digestes,
  // c'est bien plus léger et engageant pour l'utilisateur qu'un formulaire fleuve.
  currentStep = 1;
  readonly steps = [
    { id: 1, title: 'Où se trouve ton spot ?',      subtitle: 'Place le repère sur la carte',          icon: 'location-outline' },
    { id: 2, title: "Quel type d'hébergement ?",     subtitle: 'Choisis ce qui décrit le mieux le lieu', icon: 'home-outline' },
    { id: 3, title: 'Décris ton spot',               subtitle: 'Nom, description et petit(s) conseil(s)', icon: 'create-outline' },
    { id: 4, title: 'Ajoute une photo',              subtitle: 'Un visuel donne toujours envie (optionnel)', icon: 'camera-outline' },
    { id: 5, title: 'Critères essentiels',           subtitle: 'Eau, légalité, sol, réseau — si tu sais',  icon: 'shield-checkmark-outline' },
    { id: 6, title: 'Services & options',            subtitle: 'Ce que tu trouveras sur place',          icon: 'construct-outline' },
    { id: 7, title: 'Dernier coup d\'œil',           subtitle: 'Vérifie et publie ton spot',             icon: 'checkmark-circle-outline' },
  ];
  get totalSteps(): number { return this.steps.length; }
  get currentStepInfo() { return this.steps[this.currentStep - 1]; }
  get progressPercent(): number { return (this.currentStep / this.totalSteps) * 100; }

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
    this.allWaterOptions = this.spotsService.getWaterOptions();
    this.allLegalOptions = this.spotsService.getLegalOptions();
    this.allGroundOptions = this.spotsService.getGroundOptions();
    this.allNetworkOptions = this.spotsService.getNetworkOptions();

    this.spotForm = this.formBuilder.group({
      search: [''],  // ← ajoute cette ligne
      title: [''],
      description: ['', [Validators.required]],
      type: ['bivouac', [Validators.required]],
      longitude: [6.6300, [Validators.required]],
      latitude: [45.9366, [Validators.required]],
      rating: [4],
      accessibleByTrain: [false],
      isPaid: [false],
      price: [null],
      isForbiddenZone: [false],
      // Critères de survie / légalité : par défaut "non renseigné", jamais présumés
      water_availability: ['unknown'],
      legal_status: ['unknown'],
      ground_type: ['unknown'],
      network_coverage: ['unknown'],
      services: [[]],
      imagesUrl: [[]],
      location: ['Spot inconnu'],
      isFavorite: false
    });

    this.initSearch();
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

  // === GESTION DES CRITÈRES DE SURVIE (Sélection unique par champ) ===
  // Générique : sert pour water_availability, legal_status, ground_type, network_coverage
  selectFieldValue(fieldName: string, value: string): void {
    this.spotForm.get(fieldName)?.setValue(value);
  }

  isFieldValueSelected(fieldName: string, value: string): boolean {
    return this.spotForm.get(fieldName)?.value === value;
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

  // === NAVIGATION ENTRE ÉCRANS ===
  nextStep() {
    if (!this.canLeaveCurrentStep()) return;

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
    } else {
      this.goBack();
    }
  }

  goToStep(stepId: number) {
    // On autorise à revenir en arrière librement, mais pas à sauter en avant
    // au-delà de ce qui a déjà été validé.
    if (stepId < this.currentStep) {
      this.currentStep = stepId;
      this.scrollToTop();
    }
  }

  private scrollToTop() {
    const el = document.querySelector('.wizard-panel.active .panel-scroll');
    if (el) el.scrollTop = 0;
  }

  // Petite validation douce, écran par écran, pour ne jamais bloquer
  // l'utilisateur sans lui dire pourquoi.
  canLeaveCurrentStep(): boolean {
    if (this.currentStep === 3) {
      const description = this.spotForm.get('description')?.value?.trim();
      if (!description) {
        this.showToast('Ajoute une petite description pour continuer.', 'warning');
        return false;
      }
    }
    return true;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.totalSteps;
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
      price: this.spotForm.value.isPaid ? this.spotForm.value.price : 0,
      water_availability: this.spotForm.value.water_availability,
      legal_status: this.spotForm.value.legal_status,
      ground_type: this.spotForm.value.ground_type,
      network_coverage: this.spotForm.value.network_coverage
    };

    try {
      await this.spotsService.addSpot(spotData, photoUrls, serviceIds);

      await loading.dismiss();
      await this.showToast('Le spot est partagé avec la commu, parfait !', 'success');

      // Reset clean
      this.imagesUrl = []; // On vide aussi la variable locale !
      this.currentStep = 1;
      this.spotForm = this.formBuilder.group({
        search: [''],  //
        title: [''],
        description: ['', [Validators.required]],
        type: ['bivouac', [Validators.required]],
        longitude: [6.6300, [Validators.required]],
        latitude: [45.9366, [Validators.required]],
        rating: [4],
        accessibleByTrain: [false],
        isPaid: [false],
        price: [null],
        isForbiddenZone: [false],
        water_availability: ['unknown'],
        legal_status: ['unknown'],
        ground_type: ['unknown'],
        network_coverage: ['unknown'],
        services: [[]],
        imagesUrl: [[]],
        location: ['Spot inconnu'],
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

  // === HELPERS POUR L'ÉCRAN RÉCAP (étape 7) ===
  get selectedLodgingLabel(): string {
    const lodging = this.allLodging.find(l => l.id === this.spotForm.get('type')?.value);
    return lodging ? lodging.label : 'Non renseigné';
  }

  get selectedLodgingIcon(): string {
    const lodging = this.allLodging.find(l => l.id === this.spotForm.get('type')?.value);
    return lodging ? lodging.icon : 'help-outline';
  }

  get selectedServicesLabels(): string[] {
    const ids = this.spotForm.get('services')?.value || [];
    return this.allServices.filter(s => ids.includes(s.id)).map(s => s.label);
  }

  get displayTitle(): string {
    const title = this.spotForm.get('title')?.value?.trim();
    if (title) return title;
    return `${this.selectedLodgingLabel} inédit`;
  }

  initSearch() {
    this.spotForm.get('search')?.valueChanges.pipe(
      debounceTime(400),           // attend 400ms que l'user arrête de taper
      distinctUntilChanged(),      // ignore si la valeur n'a pas changé
      switchMap(query => {         // annule la requête précédente si nouvelle frappe
        if (!query || query.length < 3) return from(Promise.resolve([]));
        return from(
          fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${environment.googlePlaceApiKey}&language=fr`)
            .then(res => res.json())
        );
      })
    ).subscribe(results => {
      this.searchResults = results; // liste de suggestions à afficher
    });
  }

  selectResult(result:any){
    const lat= parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    this.updateCoordinates(lat,lng);

    if(this.map && this.marker){
      this.marker.setLatLng([lat,lng])

      this.map.setView([lat,lng])
    }

    this.searchResults=[];
    this.spotForm.get('search')?.setValue('')
  }
}

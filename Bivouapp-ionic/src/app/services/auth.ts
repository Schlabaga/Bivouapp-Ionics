import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { environment } from '../environment/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);
  public authenticated = false;

  // 1. CORRECTION ICI : Bonne syntaxe pour la méthode
  isLoggedIn(): boolean {
    // Renvoie true si on a un utilisateur, false sinon
    return this.currentUser.value !== null;
  }

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // 2. CORRECTION ICI : On ajoute les types AuthChangeEvent et Session | null pour calmer TS
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this.currentUser.next(session?.user ?? null);
      this.authenticated = session?.user !== null;
    });
  }

  // INSCRIPTION
  async signUp(email: string, pass: string) {
    return await this.supabase.auth.signUp({ email, password: pass });
  }

  // CONNEXION
  async signIn(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({ email, password: pass });
  }

  // DÉCONNEXION
  async signOut() {
    await this.supabase.auth.signOut();
  }

  // Récupérer l'utilisateur actuel (Observable)
  getUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }
}

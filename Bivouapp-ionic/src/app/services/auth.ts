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

  isLoggedIn(): boolean {
    return this.currentUser.value !== null;
  }

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this.currentUser.next(session?.user ?? null);
      this.authenticated = session?.user !== null;
    });
  }

  async signUp(email: string, pass: string) {
    return await this.supabase.auth.signUp({ email, password: pass });
  }

  async signIn(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({ email, password: pass });
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  getUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  // ← méthode manquante
  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }
}

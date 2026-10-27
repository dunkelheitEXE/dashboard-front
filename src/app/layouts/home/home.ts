import { Component, computed, inject, signal, viewChild } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CreateNote } from '../../components/create-note/create-note';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CreateNote],
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly createNote = viewChild.required(CreateNote);

  protected readonly user = this.auth.user;

  /** Sidebar colapsada (solo iconos) en escritorio. */
  protected readonly collapsed = signal(false);
  /** Sidebar abierta como drawer en móvil. */
  protected readonly mobileOpen = signal(false);

  protected readonly displayName = computed(
    () => this.user()?.name || this.user()?.username || 'Invitado',
  );

  protected readonly initials = computed(() =>
    this.displayName().charAt(0).toUpperCase(),
  );

  protected toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  protected toggleMobile(): void {
    this.mobileOpen.update((value) => !value);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }

  protected openCreateNote(): void {
    this.createNote().open();
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { taskStatusLabel } from '../../services/notes.service';
import { NotesStore } from '../../services/notes.store';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly store = inject(NotesStore);

  protected readonly notes = this.store.notes;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;

  /** Id de la nota que se está eliminando (para deshabilitar su botón). */
  protected readonly deletingId = signal<number | null>(null);
  protected readonly actionError = signal<string | null>(null);

  protected readonly statusLabel = taskStatusLabel;

  ngOnInit(): void {
    this.store.load();
  }

  protected deleteNote(id: number, title: string): void {
    if (!confirm(`¿Eliminar la nota "${title}"?`)) {
      return;
    }

    this.deletingId.set(id);
    this.actionError.set(null);

    this.store.remove(id).subscribe({
      next: () => this.deletingId.set(null),
      error: (err) => {
        this.deletingId.set(null);
        this.actionError.set(err?.error?.error ?? 'No se pudo eliminar la nota');
      },
    });
  }
}

import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  CreateNotePayload,
  Note,
  NotesService,
  UpdateNotePayload,
} from './notes.service';

/**
 * Estado compartido de las notas. La tabla (Dashboard) lo lee y el modal de
 * creación lo actualiza, así la lista se refresca sin recargar la página.
 */
@Injectable({ providedIn: 'root' })
export class NotesStore {
  private readonly notesService = inject(NotesService);

  private readonly _notes = signal<Note[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly notes = this._notes.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.notesService.getNotes().subscribe({
      next: (notes) => {
        this._notes.set(notes);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set(err?.error?.error ?? 'No se pudieron cargar las notas');
        this._loading.set(false);
      },
    });
  }

  /** Crea una nota y la antepone a la lista. */
  create(payload: CreateNotePayload): Observable<Note> {
    return this.notesService.createNote(payload).pipe(
      tap((note) => this._notes.update((notes) => [note, ...notes])),
    );
  }

  /** Elimina una nota y la quita de la lista. */
  remove(id: number): Observable<Note> {
    return this.notesService.deleteNote(id).pipe(
      tap(() =>
        this._notes.update((notes) => notes.filter((note) => note.id !== id)),
      ),
    );
  }

  /** Actualiza una nota y la reemplaza en la lista. */
  update(id: number, payload: UpdateNotePayload): Observable<Note> {
    return this.notesService
      .updateNote(id, payload)
      .pipe(tap((note) => this.replace(note)));
  }

  /** Reemplaza una nota de la lista (tras editarla). */
  replace(note: Note): void {
    this._notes.update((notes) =>
      notes.map((item) => (item.id === note.id ? note : item)),
    );
  }
}

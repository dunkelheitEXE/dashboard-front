import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import {
  Note,
  NotesService,
  taskStatusLabel,
} from '../../services/notes.service';
import { User, UsersService } from '../../services/users.service';
import { NoteForm } from '../note-form/note-form';

@Component({
  selector: 'app-note-detail',
  imports: [RouterLink, NoteForm],
  styleUrl: './note-detail.css',
  templateUrl: './note-detail.html',
})
export class NoteDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly notesService = inject(NotesService);
  private readonly usersService = inject(UsersService);

  private readonly noteForm = viewChild.required(NoteForm);

  protected readonly note = signal<Note | null>(null);
  protected readonly users = signal<User[]>([]);
  protected readonly allNotes = signal<Note[]>([]);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly statusLabel = taskStatusLabel;

  /** Usuarios que todavía no están asignados a esta nota. */
  protected readonly availableUsers = computed(() => {
    const assignedIds = new Set(this.note()?.assigned.map((u) => u.id) ?? []);
    return this.users().filter((user) => !assignedIds.has(user.id));
  });

  /** Notas que todavía no están relacionadas (ni es la propia nota). */
  protected readonly availableNotes = computed(() => {
    const current = this.note();
    if (!current) {
      return [];
    }

    const relatedIds = new Set(current.related.map((item) => item.id));
    return this.allNotes().filter(
      (item) => item.id !== current.id && !relatedIds.has(item.id),
    );
  });

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) =>
          this.notesService.getNoteById(Number(params.get('id'))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (note) => {
          this.note.set(note);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.error ?? 'No se pudo cargar la nota');
          this.loading.set(false);
        },
      });

    this.usersService.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.users.set([]),
    });

    this.notesService.getNotes().subscribe({
      next: (notes) => this.allNotes.set(notes),
      error: () => this.allNotes.set([]),
    });
  }

  protected openEdit(): void {
    const note = this.note();
    if (note) {
      this.noteForm().open(note);
    }
  }

  protected onSaved(note: Note): void {
    this.note.set(note);
  }

  protected addAssignee(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const userId = Number(select.value);
    select.value = '';

    const note = this.note();
    if (!note || !userId) {
      return;
    }

    this.saveAssignees([...note.assigned.map((u) => u.id), userId]);
  }

  protected removeAssignee(userId: number): void {
    const note = this.note();
    if (!note) {
      return;
    }

    this.saveAssignees(
      note.assigned.filter((user) => user.id !== userId).map((user) => user.id),
    );
  }

  protected addRelated(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const noteId = Number(select.value);
    select.value = '';

    const note = this.note();
    if (!note || !noteId) {
      return;
    }

    this.saveRelated([...note.related.map((item) => item.id), noteId]);
  }

  protected removeRelated(noteId: number): void {
    const note = this.note();
    if (!note) {
      return;
    }

    this.saveRelated(
      note.related.filter((item) => item.id !== noteId).map((item) => item.id),
    );
  }

  private saveAssignees(userIds: number[]): void {
    const note = this.note();
    if (!note) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.notesService.setAssignees(note.id, userIds).subscribe({
      next: (updated) => {
        this.note.set(updated);
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(
          err?.error?.error ?? 'No se pudieron actualizar los asignados',
        );
      },
    });
  }

  private saveRelated(noteIds: number[]): void {
    const note = this.note();
    if (!note) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.notesService.setRelatedNotes(note.id, noteIds).subscribe({
      next: (updated) => {
        this.note.set(updated);
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(
          err?.error?.error ?? 'No se pudieron actualizar las notas relacionadas',
        );
      },
    });
  }
}

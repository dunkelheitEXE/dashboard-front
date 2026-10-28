import {
  Component,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Note, TASK_STATUSES, TaskStatus } from '../../services/notes.service';
import { NotesStore } from '../../services/notes.store';
import { User, UsersService } from '../../services/users.service';

/**
 * Formulario de nota en un modal. Sirve para crear (sin argumentos) y para
 * editar (pasando la nota), cubriendo todos los campos del modelo.
 */
@Component({
  selector: 'app-note-form',
  imports: [ReactiveFormsModule],
  styleUrl: './note-form.css',
  templateUrl: './note-form.html',
})
export class NoteForm {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(NotesStore);
  private readonly auth = inject(AuthService);
  private readonly usersService = inject(UsersService);

  /** Emite la nota guardada (creada o editada). */
  readonly saved = output<Note>();

  private readonly dialogRef =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly statuses = TASK_STATUSES;
  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  /** null = creando, número = editando esa nota. */
  protected readonly editingId = signal<number | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    author: [''], // id del usuario como string ('' = sin autor)
    status: ['todo' as TaskStatus, [Validators.required]],
    start_date: [''],
    end_date: [''],
    content: [''],
  });

  constructor() {
    this.usersService.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.users.set([]),
    });
  }

  /** Abre el modal. Sin argumentos crea; con una nota, edita. */
  open(note?: Note): void {
    this.editingId.set(note?.id ?? null);
    this.error.set(null);
    this.loading.set(false);

    // Al crear se propone el usuario de la sesión; al editar se respeta el autor actual.
    const authorId = note ? note.author : (this.auth.user()?.id ?? null);

    this.form.reset({
      title: note?.title ?? '',
      author: authorId === null ? '' : String(authorId),
      status: note?.status ?? 'todo',
      start_date: note?.start_date ?? '',
      end_date: note?.end_date ?? '',
      content: note?.content ?? '',
    });

    this.dialogRef().nativeElement.showModal();
  }

  protected close(): void {
    this.dialogRef().nativeElement.close();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { title, author, status, start_date, end_date, content } =
      this.form.getRawValue();

    const payload = {
      title,
      author: author ? Number(author) : null,
      status,
      content: content || null,
      start_date: start_date || null,
      end_date: end_date || null,
    };

    const id = this.editingId();
    const request =
      id === null
        ? this.store.create(payload)
        : this.store.update(id, payload);

    request.subscribe({
      next: (note) => {
        this.loading.set(false);
        this.saved.emit(note);
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'No se pudo guardar la nota');
      },
    });
  }
}

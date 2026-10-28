import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type TaskStatus =
  | 'todo'
  | 'inprogress'
  | 'done'
  | 'blocked'
  | 'inreview';

/** Usuario asignado a una nota (resumen). */
export interface NoteUserRef {
  id: number;
  name: string;
  username: string;
}

/** Nota relacionada (resumen). */
export interface NoteRef {
  id: number;
  title: string;
}

/** Nota tal como la devuelve el backend (incluye autor, asignados y relacionadas). */
export interface Note {
  id: number;
  title: string;
  author: number | null;
  author_name: string | null;
  author_username: string | null;
  status: TaskStatus;
  content: string | null;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  assigned: NoteUserRef[];
  related: NoteRef[];
}

export interface CreateNotePayload {
  title: string;
  author?: number | null;
  status?: TaskStatus | null;
  content?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  assigned?: number[];
  related?: number[];
}

export type UpdateNotePayload = Partial<CreateNotePayload>;

export const TASK_STATUSES: ReadonlyArray<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'Por hacer' },
  { value: 'inprogress', label: 'En progreso' },
  { value: 'done', label: 'Hecho' },
  { value: 'blocked', label: 'Bloqueado' },
  { value: 'inreview', label: 'En revisión' },
];

export function taskStatusLabel(status: TaskStatus | null | undefined): string {
  return TASK_STATUSES.find((item) => item.value === status)?.label ?? '—';
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/notes';

  /** POST /notes — crea una nota. */
  createNote(payload: CreateNotePayload): Observable<Note> {
    return this.http.post<Note>(this.baseUrl, payload);
  }

  /** GET /notes — todas las notas. */
  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.baseUrl);
  }

  /** GET /notes/:id — una nota. */
  getNoteById(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.baseUrl}/${id}`);
  }

  /** PUT /notes/:id — actualiza (parcialmente) una nota. */
  updateNote(id: number, payload: UpdateNotePayload): Observable<Note> {
    return this.http.put<Note>(`${this.baseUrl}/${id}`, payload);
  }

  /** DELETE /notes/:id — elimina una nota. */
  deleteNote(id: number): Observable<Note> {
    return this.http.delete<Note>(`${this.baseUrl}/${id}`);
  }

  /** PUT /notes/:id/assignees — reemplaza los usuarios asignados. */
  setAssignees(id: number, userIds: number[]): Observable<Note> {
    return this.http.put<Note>(`${this.baseUrl}/${id}/assignees`, {
      users: userIds,
    });
  }

  /** PUT /notes/:id/relations — reemplaza las notas relacionadas. */
  setRelatedNotes(id: number, noteIds: number[]): Observable<Note> {
    return this.http.put<Note>(`${this.baseUrl}/${id}/relations`, {
      notes: noteIds,
    });
  }
}

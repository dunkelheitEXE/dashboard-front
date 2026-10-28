import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type UserRole = 'admin' | 'gerente' | 'supervisor' | 'operativo';

/** Usuario tal como lo devuelve el backend (nunca incluye la contraseña). */
export interface User {
  id: number;
  name: string;
  username: string;
  photo: string;
  rol: UserRole;
}

export interface CreateUserPayload {
  name: string;
  username: string;
  password: string;
  photo?: string;
  rol?: UserRole;
}

export interface LoginPayload {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/users';

  /** POST /users — crea un usuario (el backend hashea la contraseña). */
  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload);
  }

  /** POST /users/login — valida credenciales. */
  login(payload: LoginPayload): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, payload);
  }

  /** GET /users — lista de usuarios (para asignar a notas). */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }
}

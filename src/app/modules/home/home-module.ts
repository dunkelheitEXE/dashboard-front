import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Forms } from '../../layouts/forms/forms';
import { Home } from '../../layouts/home/home';
import { Login } from '../../components/login/login';
import { Signup } from '../../components/signup/signup';
import { Dashboard } from '../../components/dashboard/dashboard';
import { NoteDetail } from '../../components/note-detail/note-detail';
import { authGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: Forms,
    children: [
      {
        path: '',
        component: Login
      },
      {
        path: 'signup',
        component: Signup
      }
    ]
  },
  {
    path: 'dashboard',
    component: Home,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: Dashboard
      },
      {
        path: ':id',
        component: NoteDetail
      }
    ]
  }
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeModule {}

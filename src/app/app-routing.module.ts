import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { ForwardViewComponent } from './forward-view/forward-view.component';
import { UserViewComponent } from './user-view/user-view.component';

const routes: Routes = [
  { path: 'forward-view', component: ForwardViewComponent, canActivate:[AuthGuard]},
  { path: 'user-view', component: UserViewComponent, canActivate:[AuthGuard]},
  { path: 'login', component: LoginComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

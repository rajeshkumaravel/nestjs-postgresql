
import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';
import { Login } from './pages/login/login';

export const routes: Routes = [
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'customers',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./pages/customers/customers').then(
                (module) => module.Customers,
            ),
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'customers',
    },
    {
        path: '**',
        redirectTo: 'customers',
    },
];

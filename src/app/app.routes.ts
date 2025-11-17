import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { BlogList } from './components/blog-list/blog-list';
import { BlogDetail } from './components/blog-detail/blog-detail';
import { BlogForm } from './components/blog-form/blog-form';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'blogs', component: BlogList },
    { path: 'blogs/new', component: BlogForm },
    { path: 'blogs/edit/:id', component: BlogForm },
    { path: 'blogs/:id', component: BlogDetail },
    { path: '**', redirectTo: '' }
];

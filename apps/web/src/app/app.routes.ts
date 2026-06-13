import { Routes } from '@angular/router';
import { SnippetListComponent } from './snippets/snippet-list.component';
import { SnippetDetailComponent } from './snippets/snippet-detail.component';
import { SnippetEditorComponent } from './snippets/snippet-editor.component';
import { TagManagerComponent } from './tags/tag-manager.component';
import { CollectionBrowserComponent } from './collections/collection-browser.component';
import { CollectionDetailComponent } from './collections/collection-detail.component';
import { AuthComponent } from './auth/auth.component';
import { SearchComponent } from './search/search.component';

export const routes: Routes = [
  { path: '', redirectTo: '/snippets', pathMatch: 'full' },
  { path: 'snippets', component: SnippetListComponent },
  { path: 'snippets/new', component: SnippetEditorComponent },
  { path: 'snippets/:id', component: SnippetDetailComponent },
  { path: 'snippets/:id/edit', component: SnippetEditorComponent },
  { path: 'tags', component: TagManagerComponent },
  { path: 'collections', component: CollectionBrowserComponent },
  { path: 'collections/:id', component: CollectionDetailComponent },
  { path: 'search', component: SearchComponent },
  { path: 'auth', component: AuthComponent },
];

# Frontend Architecture

## Signal State Architecture

### Principles

1. **All component state uses signals** — `signal()` for mutable state, `computed()` for derived values
2. **No RxJS in components** — HTTP calls use `lastValueFrom()` (async/await)
3. **No `@Input()/@Output()` decorators** — Use `input()`, `output()`, `model()` signal-based APIs
4. **No constructor injection** — Use `inject()` function
5. **Zoneless change detection** — `provideZonelessChangeDetection()` in app config

### State Distribution

| State Type | Location | Example |
|-----------|----------|---------|
| Server/API state | `ApiService` (singleton) | Token, all HTTP methods |
| Component UI state | Local signals | `loading`, `error`, `snippets` |
| Derived state | `computed()` | Filtered lists, counts |

### Loading/Empty/Error Pattern

Every list component follows this pattern:

```html
@if (loading()) {
  <div><!-- Loading skeleton or spinner --></div>
} @else if (error()) {
  <div><!-- Error message + retry button --></div>
} @else if (items().length === 0) {
  <div><!-- Empty state with CTA --></div>
} @else {
  @for (item of items(); track item.id) {
    <!-- Item template -->
  }
}
```

## Component Tree

```
App (layout: sidebar + header + router-outlet)
├── SnippetListComponent — Browse/search/filter snippets
├── SnippetDetailComponent — View snippet + run AI analysis
├── SnippetEditorComponent — Create/edit form (+ tag selection)
├── TagManagerComponent — CRUD tags
├── CollectionBrowserComponent — List/create collections
├── CollectionDetailComponent — View collection snippets
├── AuthComponent — Login/Register form
└── SearchComponent — Full-text search with results
```

## Zoneless Notes

- `provideZonelessChangeDetection()` is enabled globally in `app.config.ts`
- All change detection is driven by signal changes — no `ChangeDetectorRef.detectChanges()` needed
- When using third-party libraries that require NgZone, wrap in `ngZone.run()`
- The Angular CDK (used here for forms and HTTP) works out of the box with zoneless

## Design System

Defined in `tailwind.config.js`:

| Token | Usage |
|-------|-------|
| `primary-{50-900}` | Buttons, links, focus rings |
| `surface-{50-900}` | Backgrounds, text, borders |
| `.card` | Content containers with shadow and border |
| `.btn-primary` | Primary action buttons |
| `.btn-secondary` | Secondary action buttons |
| `.input` | Text inputs and textareas |

All styling is Tailwind utility classes — no component CSS files.

## Routing

All routes are lazy-loadable (using `loadComponent` in routes). Currently all components are eagerly loaded for simplicity. Routes:

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/snippets` | SnippetListComponent | No (read) |
| `/snippets/new` | SnippetEditorComponent | Yes |
| `/snippets/:id` | SnippetDetailComponent | No (read) |
| `/snippets/:id/edit` | SnippetEditorComponent | Yes |
| `/tags` | TagManagerComponent | No (read), Yes (write) |
| `/collections` | CollectionBrowserComponent | No (read), Yes (create) |
| `/collections/:id` | CollectionDetailComponent | No (read) |
| `/search` | SearchComponent | No |
| `/auth` | AuthComponent | No |

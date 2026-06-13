import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SnippetsService } from './snippets/snippets.service';
import { TagsService } from './tags/tags.service';
import { CollectionsService } from './collections/collections.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const tagsService = app.get(TagsService);
  const snippetsService = app.get(SnippetsService);
  const collectionsService = app.get(CollectionsService);

  // Create tags
  const tagData = [
    { name: 'algorithm', color: '#EF4444' },
    { name: 'typescript', color: '#3178C6' },
    { name: 'angular', color: '#DD0031' },
    { name: 'nestjs', color: '#E0234E' },
    { name: 'python', color: '#3776AB' },
    { name: 'react', color: '#61DAFB' },
    { name: 'css', color: '#1572B6' },
    { name: 'database', color: '#336791' },
    { name: 'utility', color: '#10B981' },
    { name: 'testing', color: '#F59E0B' },
  ];

  const tags: Record<string, number> = {};
  for (const t of tagData) {
    try {
      const tag = await tagsService.create(t);
      tags[t.name] = tag.id;
    } catch {
      // Tag may already exist
      const existing = await tagsService.search(t.name);
      if (existing.length > 0) tags[t.name] = existing[0].id;
    }
  }

  // Create collections
  const collections = await Promise.all([
    collectionsService.create({ name: 'Algorithms', description: 'Algorithm implementations and patterns', color: '#EF4444' }),
    collectionsService.create({ name: 'Angular Components', description: 'Reusable Angular component snippets', color: '#DD0031' }),
    collectionsService.create({ name: 'NestJS Services', description: 'Backend service patterns', color: '#E0234E' }),
    collectionsService.create({ name: 'Utility Functions', description: 'Everyday utility functions', color: '#10B981' }),
  ]);

  // Create snippets
  const snippetData = [
    {
      title: 'Binary Search Implementation',
      description: 'A generic binary search algorithm that works on sorted arrays',
      language: 'typescript',
      code: [
        'function binarySearch<T>(arr: T[], target: T): number {',
        '  let left = 0;',
        '  let right = arr.length - 1;',
        '',
        '  while (left <= right) {',
        '    const mid = Math.floor((left + right) / 2);',
        '    if (arr[mid] === target) return mid;',
        '    if (arr[mid] < target) left = mid + 1;',
        '    else right = mid - 1;',
        '  }',
        '',
        '  return -1; // not found',
        '}',
      ].join('\n'),
      tagIds: [tags['algorithm'], tags['typescript']],
    },
    {
      title: 'Angular Signal Store Pattern',
      description: 'Simple state management using Angular signals with computed properties',
      language: 'typescript',
      code: [
        'import { signal, computed, inject } from "@angular/core";',
        'import { HttpClient } from "@angular/common/http";',
        '',
        'interface Todo {',
        '  id: number;',
        '  title: string;',
        '  completed: boolean;',
        '}',
        '',
        '// In a component or service:',
        'const todos = signal<Todo[]>([]);',
        'const loading = signal(false);',
        'const error = signal<string | null>(null);',
        '',
        '// Computed derived state',
        'const completedCount = computed(() =>',
        '  todos().filter((t) => t.completed).length',
        ');',
        'const pendingTodos = computed(() =>',
        '  todos().filter((t) => !t.completed)',
        ');',
        '',
        'const http = inject(HttpClient);',
        '',
        'async function loadTodos() {',
        '  loading.set(true);',
        '  error.set(null);',
        '  try {',
        '    const data = await http.get<Todo[]>("/api/todos").toPromise();',
        '    todos.set(data ?? []);',
        '  } catch (e) {',
        '    error.set("Failed to load todos");',
        '  } finally {',
        '    loading.set(false);',
        '  }',
        '}',
      ].join('\n'),
      tagIds: [tags['angular'], tags['typescript']],
    },
    {
      title: 'NestJS JWT Auth Guard',
      description: 'Complete JWT authentication guard implementation for NestJS',
      language: 'typescript',
      code: [
        'import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";',
        'import { AuthGuard } from "@nestjs/passport";',
        'import { Reflector } from "@nestjs/core";',
        '',
        '@Injectable()',
        'export class JwtAuthGuard extends AuthGuard("jwt") {',
        '  constructor(private reflector: Reflector) {',
        '    super();',
        '  }',
        '',
        '  canActivate(context: ExecutionContext) {',
        '    const isPublic = this.reflector.getAllAndOverride<boolean>(',
        '      IS_PUBLIC_KEY,',
        '      [context.getHandler(), context.getClass()],',
        '    );',
        '    if (isPublic) return true;',
        '    return super.canActivate(context);',
        '  }',
        '',
        '  handleRequest(err: any, user: any) {',
        '    if (err || !user) {',
        '      throw err || new UnauthorizedException();',
        '    }',
        '    return user;',
        '  }',
        '}',
      ].join('\n'),
      tagIds: [tags['nestjs'], tags['typescript']],
    },
    {
      title: 'Python Quick Sort',
      description: 'Optimized quicksort implementation with random pivot selection',
      language: 'python',
      code: [
        'import random',
        'from typing import List',
        '',
        'def quicksort(arr: List[int]) -> List[int]:',
        '    if len(arr) <= 1:',
        '        return arr',
        '',
        '    pivot = random.choice(arr)',
        '    left = [x for x in arr if x < pivot]',
        '    middle = [x for x in arr if x == pivot]',
        '    right = [x for x in arr if x > pivot]',
        '',
        '    return quicksort(left) + middle + quicksort(right)',
        '',
        'def quicksort_inplace(arr: List[int], low: int = 0, high: int | None = None) -> None:',
        '    if high is None:',
        '        high = len(arr) - 1',
        '    if low < high:',
        '        pi = partition(arr, low, high)',
        '        quicksort_inplace(arr, low, pi - 1)',
        '        quicksort_inplace(arr, pi + 1, high)',
        '',
        'def partition(arr: List[int], low: int, high: int) -> int:',
        '    pivot = arr[high]',
        '    i = low - 1',
        '    for j in range(low, high):',
        '        if arr[j] <= pivot:',
        '            i += 1',
        '            arr[i], arr[j] = arr[j], arr[i]',
        '    arr[i + 1], arr[high] = arr[high], arr[i + 1]',
        '    return i + 1',
      ].join('\n'),
      tagIds: [tags['algorithm'], tags['python']],
    },
    {
      title: 'CSS Grid Dashboard Layout',
      description: 'Responsive dashboard layout using CSS Grid with auto-fill',
      language: 'css',
      code: [
        '.dashboard {',
        '  display: grid;',
        '  grid-template-columns: 250px 1fr;',
        '  grid-template-rows: 60px 1fr;',
        '  grid-template-areas:',
        '    "sidebar header"',
        '    "sidebar main";',
        '  min-height: 100vh;',
        '}',
        '',
        '.header { grid-area: header; }',
        '.sidebar { grid-area: sidebar; }',
        '.main { grid-area: main; }',
        '',
        '@media (max-width: 768px) {',
        '  .dashboard {',
        '    grid-template-columns: 1fr;',
        '    grid-template-areas: "header" "main";',
        '  }',
        '  .sidebar { display: none; }',
        '}',
      ].join('\n'),
      tagIds: [tags['css']],
    },
    {
      title: 'TypeORM Repository with Pagination',
      description: 'Reusable pagination pattern for TypeORM repositories',
      language: 'typescript',
      code: [
        'import { Repository, FindManyOptions } from "typeorm";',
        '',
        'export interface PaginatedResult<T> {',
        '  data: T[];',
        '  total: number;',
        '  page: number;',
        '  limit: number;',
        '  totalPages: number;',
        '}',
        '',
        'export async function paginate<T>(',
        '  repo: Repository<T>,',
        '  options: FindManyOptions<T>,',
        '  page: number = 1,',
        '  limit: number = 20,',
        '): Promise<PaginatedResult<T>> {',
        '  const [data, total] = await repo.findAndCount({',
        '    ...options,',
        '    skip: (page - 1) * limit,',
        '    take: limit,',
        '  });',
        '',
        '  return { data, total, page, limit,',
        '    totalPages: Math.ceil(total / limit),',
        '  };',
        '}',
      ].join('\n'),
      tagIds: [tags['nestjs'], tags['typescript'], tags['database']],
    },
    {
      title: 'Angular Reactive Form Validators',
      description: 'Custom reactive form validators for common patterns',
      language: 'typescript',
      code: [
        'import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";',
        '',
        'export function passwordStrengthValidator(): ValidatorFn {',
        '  return (control: AbstractControl): ValidationErrors | null => {',
        '    const value = control.value || "";',
        '    const hasUpper = /[A-Z]/.test(value);',
        '    const hasLower = /[a-z]/.test(value);',
        '    const hasNumber = /[0-9]/.test(value);',
        '    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);',
        '    const valid = hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8;',
        '    return valid ? null : { passwordStrength: true };',
        '  };',
        '}',
        '',
        'export function matchFieldsValidator(field1: string, field2: string): ValidatorFn {',
        '  return (control: AbstractControl): ValidationErrors | null => {',
        '    const v1 = control.get(field1)?.value;',
        '    const v2 = control.get(field2)?.value;',
        '    return v1 === v2 ? null : { fieldsMismatch: { fields: [field1, field2] } };',
        '  };',
        '}',
      ].join('\n'),
      tagIds: [tags['angular'], tags['typescript'], tags['utility']],
    },
    {
      title: 'SQL Query with Window Functions',
      description: 'PostgreSQL window function examples for analytics',
      language: 'sql',
      code: [
        '-- Running total of sales by day',
        'SELECT',
        '  sale_date,',
        '  amount,',
        '  SUM(amount) OVER (ORDER BY sale_date) AS running_total',
        'FROM daily_sales',
        'ORDER BY sale_date;',
        '',
        '-- Rank users by score within their team',
        'SELECT',
        '  username, score, team,',
        '  RANK() OVER (PARTITION BY team ORDER BY score DESC) AS team_rank',
        'FROM users WHERE score IS NOT NULL;',
        '',
        '-- Moving average (7-day window)',
        'SELECT',
        '  date, value,',
        '  AVG(value) OVER (',
        '    ORDER BY date',
        '    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW',
        '  ) AS moving_avg_7d',
        'FROM time_series;',
      ].join('\n'),
      tagIds: [tags['database']],
    },
  ];

  for (const s of snippetData) {
    try {
      await snippetsService.create({
        title: s.title,
        description: s.description,
        language: s.language,
        code: s.code,
        tagIds: s.tagIds,
      });
    } catch (err) {
      console.error('Failed to create snippet "' + s.title + '":', err);
    }
  }

  // Add snippets to collections
  const allSnippets = await snippetsService.findAll();
  if (allSnippets.length > 0) {
    await collectionsService.addSnippet(collections[0].id, allSnippets[0].id);
    await collectionsService.addSnippet(collections[0].id, allSnippets[3].id);
    await collectionsService.addSnippet(collections[1].id, allSnippets[1].id);
    await collectionsService.addSnippet(collections[1].id, allSnippets[6].id);
    await collectionsService.addSnippet(collections[2].id, allSnippets[2].id);
    await collectionsService.addSnippet(collections[2].id, allSnippets[5].id);
    await collectionsService.addSnippet(collections[3].id, allSnippets[6].id);
  }

  console.log('Seed complete!');
  console.log('  Tags:', Object.keys(tags).length);
  console.log('  Collections:', collections.length);
  console.log('  Snippets:', allSnippets.length);
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

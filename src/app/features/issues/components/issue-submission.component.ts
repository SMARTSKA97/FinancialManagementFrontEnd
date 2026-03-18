import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IssueService } from '../services/issue.service';
import { Issue, IssueTaxonomy } from '../models/issue.model';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-issue-submission',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Submit New Issue</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <!-- 1. Discovery Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input type="text" formControlName="title" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 dark:text-white p-2 border" 
            placeholder="e.g. Transactions not syncing" />
            
          <!-- Live Similarity Suggestions -->
          @if (similarIssues().length > 0) {
            <div class="mt-2 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-700">
              <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Looks similar to existing issues:
              </p>
              <ul class="space-y-2">
                @for (issue of similarIssues(); track issue.id) {
                  <li class="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
                    <span>#{{issue.id}} - {{issue.title}}</span>
                    <span class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{{issue.status}}</span>
                  </li>
                }
              </ul>
              <div class="mt-3 text-right">
                <button type="button" class="text-sm text-indigo-600 hover:text-indigo-500">View these issues instead</button>
              </div>
            </div>
          }
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
           <textarea formControlName="description" rows="4" 
             class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white p-2 border"></textarea>
        </div>

        <!-- 2. Taxonomy -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select formControlName="categoryId" (change)="onCategoryChange()"
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white p-2 border">
                 <option [ngValue]="null">Select Category</option>
                 @for (cat of categories(); track cat.id) {
                     <option [value]="cat.id">{{cat.name}}</option>
                 }
              </select>
            </div>
            
            @if (subcategories().length > 0) {
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcategory</label>
              <select formControlName="subcategoryId"
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white p-2 border">
                 <option [ngValue]="null">Select Subcategory</option>
                 @for (sub of subcategories(); track sub.id) {
                     <option [value]="sub.id">{{sub.name}}</option>
                 }
              </select>
            </div>
            }
        </div>

        <!-- 3. Impact Assessment (Ranking 2.0) -->
        <div class="border-t pt-4 mt-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Impact Assessment</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
                   <select formControlName="severity"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white p-2 border">
                       <option value="Minor">Minor</option>
                       <option value="Major">Major</option>
                       <option value="Critical">Critical</option>
                   </select>
                </div>

                <div>
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
                   <select formControlName="frequency"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white p-2 border">
                       <option value="Rare">Rare</option>
                       <option value="Frequent">Frequent</option>
                       <option value="Always">Always</option>
                   </select>
                </div>
            </div>

            <div class="mt-4 flex items-center">
                 <input type="checkbox" formControlName="impactsMoney" id="impactsMoney"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                 <label for="impactsMoney" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    This issue causes explicit financial loss or discrepancy
                 </label>
            </div>
            
            @if (form.get('impactsMoney')?.value) {
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Amount (₹)</label>
                  <input type="number" formControlName="financialImpactAmount"
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white p-2 border" />
                </div>
            }
        </div>

        <div class="pt-6">
           <button type="submit" [disabled]="form.invalid || isSubmitting()"
             class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
             {{ isSubmitting() ? 'Submitting...' : 'Submit Issue' }}
           </button>
        </div>
      </form>
    </div>
  `
})
export class IssueSubmissionComponent {
    private fb = inject(FormBuilder);
    private issueService = inject(IssueService);

    categories = signal<IssueTaxonomy[]>([]);
    subcategories = signal<IssueTaxonomy[]>([]);
    similarIssues = signal<Issue[]>([]);
    isSubmitting = signal(false);

    form = this.fb.group({
        title: ['', Validators.required],
        description: ['', Validators.required],
        categoryId: [null as number | null, Validators.required],
        subcategoryId: [null as number | null],
        severity: ['Minor', Validators.required],
        frequency: ['Rare', Validators.required],
        impactsMoney: [false],
        financialImpactAmount: [null as number | null]
    });

    constructor() {
        this.loadTaxonomy();
        this.setupSimilarityCheck();
    }

    loadTaxonomy() {
        this.issueService.getTaxonomies().subscribe(cats => {
            this.categories.set(cats);
        });
    }

    onCategoryChange() {
        const catId = this.form.get('categoryId')?.value;
        const cat = this.categories().find(c => c.id == catId); // Loose equality for select output
        this.subcategories.set(cat?.children || []);
        this.form.patchValue({ subcategoryId: null });
    }

    setupSimilarityCheck() {
        this.form.get('title')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            filter(term => (term?.length || 0) > 3),
            switchMap(term => this.issueService.checkSimilar(term || '', this.form.get('description')?.value || ''))
        ).subscribe(issues => {
            this.similarIssues.set(issues);
        });
    }

    onSubmit() {
        if (this.form.valid) {
            this.isSubmitting.set(true);
            this.issueService.createIssue(this.form.value as any).subscribe({
                next: (id) => {
                    alert(`Issue #${id} created!`);
                    this.isSubmitting.set(false);
                    this.form.reset({ severity: 'Minor', frequency: 'Rare' });
                    this.similarIssues.set([]);
                },
                error: () => this.isSubmitting.set(false)
            });
        }
    }
}

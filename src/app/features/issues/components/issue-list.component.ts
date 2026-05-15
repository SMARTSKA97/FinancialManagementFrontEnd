import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueService } from '../services/issue.service';
import { Issue } from '../models/issue.model';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-issue-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Issue Board</h2>
        <a routerLink="new" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          + New Issue
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Sidebar Filters -->
        <div class="col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-fit">
            <h3 class="font-semibold mb-3 dark:text-gray-200">Sort By</h3>
            <div class="space-y-2">
                <button (click)="loadIssues('pain')" [class.font-bold]="currentSort() === 'pain'" class="block w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300">
                    🔥 Pain Score
                </button>
                <button (click)="loadIssues('date')" [class.font-bold]="currentSort() === 'date'" class="block w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300">
                    📅 Newest
                </button>
            </div>
            
             <h3 class="font-semibold mb-3 mt-6 dark:text-gray-200">Values</h3>
             <div class="text-xs text-gray-500 dark:text-gray-400">
                Pain Score = (Impact * Frequency * Severity) + Financial Risk
             </div>
        </div>

        <!-- Issue List -->
        <div class="col-span-3 space-y-4">
            @for (issue of issues(); track issue.id) {
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4" 
                     [class.border-l-red-500]="issue.painScore > 500"
                     [class.border-l-yellow-500]="issue.painScore <= 500 && issue.painScore > 100"
                     [class.border-l-green-500]="issue.painScore <= 100">
                     
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="flex items-center space-x-2">
                                <span class="text-xs font-bold text-gray-500">#{{issue.id}}</span>
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{issue.title}}</h3>
                            </div>
                            <p class="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{{issue.description}}</p>
                            <div class="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">{{issue.categoryName}}</span>
                                <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">{{issue.status}}</span>
                                <span>{{issue.createdAt | date}}</span>
                            </div>
                        </div>
                        <div class="text-right">
                             <div class="text-2xl font-bold" [class.text-red-600]="issue.painScore > 500" [class.text-gray-700]="issue.painScore <= 500">
                                {{issue.painScore | number:'1.0-0'}}
                             </div>
                             <div class="text-xs text-gray-400 uppercase tracking-wider">Pain Score</div>
                        </div>
                    </div>
                </div>
            }
        </div>
      </div>
    </div>
  `
})
export class IssueListComponent {
    private issueService = inject(IssueService);
    issues = signal<Issue[]>([]);
    currentSort = signal('pain');

    constructor() {
        this.loadIssues('pain');
    }

    loadIssues(sort: string) {
        this.currentSort.set(sort);
        this.issueService.getIssues(undefined, sort).subscribe(data => {
            this.issues.set(data);
        });
    }
}

import { Routes } from '@angular/router';
import { IssueSubmissionComponent } from './components/issue-submission.component';
import { IssueListComponent } from './components/issue-list.component';

export const ISSUES_ROUTES: Routes = [
    {
        path: '',
        component: IssueListComponent,
        data: { title: 'Issue Board' }
    },
    {
        path: 'new',
        component: IssueSubmissionComponent,
        data: { title: 'Submit Issue' }
    },
];

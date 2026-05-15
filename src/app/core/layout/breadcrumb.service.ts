import { Injectable, signal, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BreadcrumbService {
    private _items = signal<MenuItem[]>([]);
    items = computed(() => this._items());

    // Subject to trigger data refresh on current page
    private _refresh$ = new Subject<void>();
    refresh$ = this._refresh$.asObservable();

    setItems(items: MenuItem[]) {
        // Remove "Dashboard" if it's the first element or present
        const filteredItems = items.filter(item => item.label !== 'Dashboard');
        this._items.set(filteredItems);
    }

    refresh() {
        this._refresh$.next();
    }
}

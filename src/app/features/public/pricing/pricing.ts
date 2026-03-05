import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pricing',
  imports: [RouterLink, ButtonModule, ToggleButtonModule, FormsModule],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss'
})
export class Pricing {
  showPricing = false;
}

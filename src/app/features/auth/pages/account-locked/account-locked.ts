import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-account-locked',
  templateUrl: './account-locked.html',
  styleUrls: ['./account-locked.scss'],
  standalone: false
})
export class AccountLockedComponent implements OnInit, OnDestroy {
  countdown = '15:00';
  canGoBack = false;

  private totalSeconds = 15 * 60;
  private timerId: any;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const minutes = Number(this.route.snapshot.queryParamMap.get('minutes'));
    if (!Number.isNaN(minutes) && minutes > 0) {
      this.totalSeconds = minutes * 60;
    }

    this.tick(); 
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  private tick(): void {
    const m = Math.floor(this.totalSeconds / 60);
    const s = this.totalSeconds % 60;
    this.countdown = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (this.totalSeconds <= 0) {
      this.canGoBack = true;
      clearInterval(this.timerId);
      return;
    }

    this.totalSeconds--;
  }

  goBack(): void {
    this.router.navigate(['/auth/login']);
  }
}
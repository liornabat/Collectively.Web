import { inject, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';

@inject(Router)
export class StatisticsList {
  @bindable header = '';
  @bindable items = [];

  constructor(router) {
    this.router = router;
  }
}

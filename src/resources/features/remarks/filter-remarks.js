import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {I18N} from 'aurelia-i18n';
import TranslationService from 'resources/services/translation-service';
import LocationService from 'resources/services/location-service';
import FiltersService from 'resources/services/filters-service';
import ToastService from 'resources/services/toast-service';
import RemarkService from 'resources/services/remark-service';

@inject(Router, I18N, TranslationService,
 LocationService, FiltersService, ToastService, RemarkService)
export class FilterRemarks {
  constructor(router, i18n, translationService, locationService, filtersService, toast, remarkService) {
    this.router = router;
    this.i18n = i18n;
    this.translationService = translationService;
    this.location = locationService;
    this.filtersService = filtersService;
    this.toast = toast;
    this.remarkService = remarkService;
    this.filters = this.filtersService.filters;
  }

  async activate() {
    this.location.startUpdating();
    await this.setupCategoriesFilter();
    this.setupStateFilter();
    this.setupTypeFilter();
  }

  deactivate() {
    this.filterRemarks();
  }

  resetFilters() {
    this.categories.forEach(c => c.checked = true);
    this.filters = this.filtersService.defaultFilters;
    this._updateFilters();
  }

  filterRemarks() {
    this.filters.categories = this.selectedCategories;
    this._updateFilters();
  }

  get selectedCategories() {
    return $.grep(this.categories, c => c.checked)
            .map(c => c.name);
  }

  async setupCategoriesFilter() {
    let that = this;
    let categories = await this.remarkService.getCategories();
    categories.forEach(c => {
      if (typeof(that.filters.categories) === 'undefined' || that.filters.categories.length === 0) {
        c.checked = true;
      } else {
        c.checked = that.filters.categories.indexOf(c.name) !== -1;
      }
    });
    that.categories = categories;
  }

  setupStateFilter() {
    this.states = [ {name: this.translationService.trCapitalized('remark.state_active'), value: 'active'},
     {name: this.translationService.trCapitalized('remark.state_resolved'), value: 'resolved'},
     {name: this.translationService.trCapitalized('common.all'), value: 'all'}
     ];
  }

  setupTypeFilter() {
    this.types = [ {name: this.translationService.trCapitalized('common.all'), value: 'all'},
     {name: this.translationService.trCapitalized('common.mine'), value: 'mine'}
     ];
  }

  _updateFilters() {
    this.filtersService.filters = this.filters;
  }
}

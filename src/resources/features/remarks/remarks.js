import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import LocationService from 'resources/services/location-service';
import RemarkService from 'resources/services/remark-service';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(Router, LocationService, RemarkService, EventAggregator)
export class Remarks {
    constructor(router, locationService, remarkService, eventAggregator) {
        this.router = router;
        this.locationService = locationService;
        this.remarkService = remarkService;
        this.eventAggregator = eventAggregator;
        this.remarks = [];
    }

    async activate(){
        this.eventAggregator.subscribe('map:loaded', async response => {
            await this.browse();
        })
    }

    async browse(){
        this.remarks = await this.remarkService.browse();
    }
}

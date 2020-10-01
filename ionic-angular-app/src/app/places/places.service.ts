import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places: Place[] = [
    new Place('p1', 'Manhattan Mansion', 'In the heart of NYC', 'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042533/Carnegie-Mansion-nyc.jpg', 149.99, new Date('2020-01-01'), new Date('2021-12-31')),
    new Place('p2', 'L\'Amour Toujours', 'A romantic place in Paris', 'https://i.insider.com/5ce6d365a7999b402d5c4c57?width=1100&format=jpeg&auto=webp', 199.99, new Date('2020-01-01'), new Date('2021-12-31')),
    new Place('p3', 'The Foggy Palace', 'Not the average city trip!', 'https://thumbs.dreamstime.com/b/foggy-creepy-mansion-187376420.jpg', 99.99,  new Date('2020-01-01'), new Date('2021-12-31'))
  ];

  get places() {
    return [...this._places];
  }

  constructor() { }

  getPlace(id: string) {
    return {...this._places.find(p => p.id === id)};
  }
}

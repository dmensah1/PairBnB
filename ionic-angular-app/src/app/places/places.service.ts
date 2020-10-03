import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place('p1', 'Manhattan Mansion', 'In the heart of NYC', 'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042533/Carnegie-Mansion-nyc.jpg', 149.99, new Date('2020-01-01'), new Date('2021-12-31'), 'abc'),
    new Place('p2', 'L\'Amour Toujours', 'A romantic place in Paris', 'https://i.insider.com/5ce6d365a7999b402d5c4c57?width=1100&format=jpeg&auto=webp', 199.99, new Date('2020-01-01'), new Date('2021-12-31'), 'abc'),
    new Place('p3', 'The Foggy Palace', 'Not the average city trip!', 'https://thumbs.dreamstime.com/b/foggy-creepy-mansion-187376420.jpg', 99.99,  new Date('2020-01-01'), new Date('2021-12-31'), 'abc')
  ]); 

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService) { }

  getPlace(id: string) {
    // returning an observable to which we can subscribe
    return this.places.pipe(
      take(1), 
      map(places => {
      return {...places.find(p => p.id === id)};
    }));
    
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    // creating a new palce
    const newPlace = new Place(Math.random().toString(),
    title, 
    description, 
    'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042533/Carnegie-Mansion-nyc.jpg', 
    price, 
    dateFrom, 
    dateTo,
    this.authService.userId
    );

    // subscribe to places but take 1 object and cancel subscription
    // gives us the latest places array to push new place onto
    return this.places.pipe(
      take(1), 
      delay(1000),
      tap((places)=>{
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(
      take(1), 
      delay(1000), 
      tap( places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        const updatedPlaces = [...places];

        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(oldPlace.id, title, description, oldPlace.imageUrl, oldPlace.price, oldPlace.availableFrom, oldPlace.availableTo, oldPlace.userId);
        this._places.next(updatedPlaces);
      }));
  }
}

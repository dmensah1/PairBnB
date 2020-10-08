import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';
/* 
   new Place('p1', 'Manhattan Mansion', 'In the heart of NYC', 'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042533/Carnegie-Mansion-nyc.jpg', 149.99, new Date('2020-01-01'), new Date('2021-12-31'), 'abc'),
    new Place('p2', 'L\'Amour Toujours', 'A romantic place in Paris', 'https://i.insider.com/5ce6d365a7999b402d5c4c57?width=1100&format=jpeg&auto=webp', 199.99, new Date('2020-01-01'), new Date('2021-12-31'), 'abc'),
    new Place('p3', 'The Foggy Palace', 'Not the average city trip!', 'https://thumbs.dreamstime.com/b/foggy-creepy-mansion-187376420.jpg', 99.99,  new Date('2020-01-01'), new Date('2021-12-31'), 'abc')
 
*/

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]); 

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) { }

  fetchPlaces() {
    return this.http
    // we define object we receive from request in bracket
    .get<{ [key: string]: PlaceData }>('https://pairbnb-app.firebaseio.com/offered-places.json')
    .pipe(map(resData => {
      // go through response object and extract places into local array
      const places = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          places.push(
            new Place(
              key, 
              resData[key].title, 
              resData[key].description, 
              resData[key].imageUrl, 
              resData[key].price, 
              new Date(resData[key].availableFrom), 
              new Date(resData[key].availableTo),
              resData[key].userId,
              resData[key].location
            ));
        }
      }
      // returning restructued local places array
      return places;
    }),
    tap(places => {
      this._places.next(places);
    })  
    );
  }

  getPlace(id: string) {
    // returning an observable to which we can subscribe
    return this.http
    .get<PlaceData>(
      `https://pairbnb-app.firebaseio.com/offered-places/${id}.json`
    )
    .pipe(
      map(placeData => {
        return new Place(id, placeData.title, placeData.description, placeData.imageUrl, placeData.price, new Date(placeData.availableFrom), new Date(placeData.availableTo), placeData.userId, placeData.location);
      })
    );
    
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation) {
    // creating a new palce
    const newPlace = new Place(
    Math.random().toString(),
    title, 
    description, 
    'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042533/Carnegie-Mansion-nyc.jpg', 
    price, 
    dateFrom, 
    dateTo,
    this.authService.userId,
    location
    );

    let generatedId: string;
    // making the post request to server as an obserable
     return this.http
     .post<{name: string}>('https://pairbnb-app.firebaseio.com/offered-places.json',{...newPlace, id: null })
     .pipe(
      switchMap(resData => {
        // storing unique id generated by database
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap((places)=>{
        // storing the id & adding place
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
     );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];

    return this.places.pipe(
      take(1), 
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          // of wraps array into new observable that'll immediately emit a value
          return of(places);
        }
      }),

      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];

        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(oldPlace.id, title, description, oldPlace.imageUrl, oldPlace.price, oldPlace.availableFrom, oldPlace.availableTo, oldPlace.userId, oldPlace.location);
        return this.http.put(
        `https://pairbnb-app.firebaseio.com/offered-places/${placeId}.json`,
        {...updatedPlaces[updatedPlaceIndex], id: null}
      );

      }),

      tap(() => {
        this._places.next(updatedPlaces);
      })
      ); 
  }
}

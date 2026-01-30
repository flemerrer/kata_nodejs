import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class ApiPastriesService {
  private http = inject(HttpClient)

  fetchPastries(): any {
    return this.http.get("http://localhost:3000/pastries");
  }
}

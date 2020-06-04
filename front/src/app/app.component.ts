import { Component } from '@angular/core';
import MeiliSearch, { Index } from 'meilisearch'
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'front';
  query = "";
  lastquery = "";
  ms: MeiliSearch;
  index: Index;
  cities: City[] = [];

  Constructor() {
  }

  async ngOnInit() {
    this.ms = new MeiliSearch({host: environment.meiliEndpoint});
    this.index = await this.ms.getIndex("city");

  }

  async search(e) {
    if (this.query != this.lastquery) {
      const result = this.index.search(this.query);
      this.cities = (await result).hits;
      console.log(this.cities);

      this.lastquery = this.query;
    }
  }
}

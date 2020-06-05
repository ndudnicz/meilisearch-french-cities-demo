import { Component } from '@angular/core';
import MeiliSearch, { Index, IndexStats } from 'meilisearch'
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
  numberOfDoc: number = 0;

  Constructor() {
  }

  async ngOnInit() {
    this.ms = new MeiliSearch({host: environment.meiliEndpoint});
    this.index = await this.ms.getIndex("city");
    setInterval(async () => {
        const stats: IndexStats = await this.index.getStats();
        this.numberOfDoc = stats.numberOfDocuments;
    }, 1000);
  }

  async search(e) {
    if (this.query != this.lastquery) {
      const result = this.index.search(this.query);
      this.cities = (await result).hits;
      this.lastquery = this.query;
    }
  }
}

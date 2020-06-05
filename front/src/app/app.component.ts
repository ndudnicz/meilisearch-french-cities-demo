import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import MeiliSearch, { Index, IndexStats, Keys } from 'meilisearch'
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'front';
    query = "";
    lastquery = "";
    ms: MeiliSearch;
    index: Index;
    cities: City[] = [];
    numberOfDoc: number = 0;
    publicKey: string = "";

    constructor(private _http: HttpClient) {
    }

    getPublicKey(): Promise<string> {
        return new Promise((resolve, reject) => {
            this._http.get(environment.apiEndpoint + "/default/getkey").subscribe(data => {
                resolve((data as any).key);
            })
        });
    }

    getNumberOfDoc(): Promise<number> {
        return new Promise((resolve, reject) => {
            this._http.get(environment.apiEndpoint + "/default/getnumberofdoc").subscribe(data => {
                resolve((data as any).numberOfDocuments);
            })
        });
    }

    async ngOnInit() {
        this.publicKey = await this.getPublicKey();
        this.ms = new MeiliSearch({ host: environment.meiliEndpoint, apiKey: this.publicKey });
        this.index = await this.ms.getIndex("city");
        await this.setStats();
        setInterval(async () => {
            await this.setStats();
        }, 10000);
    }

    async setStats() {
        this.numberOfDoc = await this.getNumberOfDoc();
    }

    async search(e) {
        if (this.query != this.lastquery) {
            const result = this.index.search(this.query);
            this.cities = (await result).hits;
            this.lastquery = this.query;
        }
    }
}

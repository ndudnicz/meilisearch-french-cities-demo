Demo app using [Meilisearch](https://github.com/meilisearch/MeiliSearch), [MeilisearchDotnet](https://github.com/ndudnicz/meilisearch-dotnet) and [meilisearch-js](https://github.com/meilisearch/meilisearch-js)

A dotnet core app will gather some french cities (~34970) from a public api and store them in a meilisearch

Then you will be able to find the cities by typing whatever you want in the searchbar

```bash
$> docker-compose up --build --force-recreate
```
The front is running on [http://localhost](http://localhost)

![demo gif](https://github.com/ndudnicz/meilisearch-french-cities-demo/blob/master/medias/demo.gif)

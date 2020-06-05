using System;
using MeilisearchDotnet;
using System.Threading.Tasks;
using System.Net.Http;
using System.Collections.Generic;

namespace server
{
    class Program
    {
        public class City
        {
            public string nom { get; set; }
            public string code { get; set; }
            public IEnumerable<string> codesPostaux { get; set; }
        }

        public class Region
        {
            public string code { get; set; }
        }


        static async Task Main(string[] args)
        {
            await Task.Delay(3000);
            Meilisearch ms = new Meilisearch("http://meili:7700", "masterKey");
            MeilisearchDotnet.Index index = await ms.GetOrCreateIndex(new MeilisearchDotnet.Types.IndexRequest
            {
                Uid = "city",
                PrimaryKey = "code"
            });
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri("https://geo.api.gouv.fr");
            client.DefaultRequestHeaders.Add("accept", "application/json");

            HttpResponseMessage res = await client.GetAsync("/departements?fields=code");
            List<Region> departements = await res.Content.ReadAsAsync<List<Region>>();
            while (true)
            {
                int n = 0;
                for (int d = 0; d < departements.Count; d++)
                {
                    res = await client.GetAsync("/departements/" + departements[d].code + "/communes?fields=nom,code,codesPostaux&format=json&geometry=centre");
                    List<City> cities = await res.Content.ReadAsAsync<List<City>>();
                    Console.WriteLine(string.Format("Found {0} cities for region ({1}), start adding documents", cities.Count, departements[d].code));
                    int i = 0;
                    MeilisearchDotnet.Types.EnqueuedUpdate q;
                    for (; i + 5000 < cities.Count; i += 5000)
                    {
                        Console.WriteLine(string.Format("Adding 1000 cities [\"{0}\" .. \"{1}\"]", cities[i].nom, cities[i + 4999].nom));
                        q = await index.AddDocuments<City>(cities.GetRange(i, i + 4999));
                        await index.WaitForPendingUpdate(q.UpdateId, 30000);
                        n += 5000;
                    }
                    Console.WriteLine(string.Format("Adding {2} cities [\"{0}\" .. \"{1}\"]", cities[i].nom, cities[cities.Count - 1].nom, cities.Count - i));
                    q = await index.AddDocuments<City>(cities.GetRange(i, cities.Count - 1));
                    await index.WaitForPendingUpdate(q.UpdateId, 30000);
                    n += cities.Count - i;
                }
                Console.WriteLine(string.Format("{0} documents added, waiting 300 seconds ...", n));
                await Task.Delay(300000);
            }
        }
    }
}

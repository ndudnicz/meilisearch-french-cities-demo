using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using MeilisearchDotnet;

namespace api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DefaultController : ControllerBase
    {
        private readonly ILogger<DefaultController> _logger;
        private readonly IConfiguration _config;

        public DefaultController(ILogger<DefaultController> logger, IConfiguration config)
        {
            _logger = logger;
            _config = config;
        }

        [HttpGet("getkey")]
        public async Task<object> Get()
        {
            Meilisearch ms = new Meilisearch(_config["MeilisearchEndpoint"], _config["MeilisearchMasterKey"]);
            MeilisearchDotnet.Types.Keys keys = await ms.GetKeys();
            return new { key = keys.Public };
        }

        [HttpGet("getnumberofdoc")]
        public async Task<object> GetNumberOfDoc()
        {
            Meilisearch ms = new Meilisearch(_config["MeilisearchEndpoint"], _config["MeilisearchMasterKey"]);
            MeilisearchDotnet.Index index = await ms.GetOrCreateIndex(new MeilisearchDotnet.Types.IndexRequest {
                Uid = "city"
            });
            MeilisearchDotnet.Types.IndexStats stats = await index.GetStats();
            return new { numberOfDocuments = stats.NumberOfDocuments };
        }

    }
}

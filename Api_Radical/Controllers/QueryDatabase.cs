using ApiTest01.Models;
using ApiTest01.Services;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System;

namespace ApiTest01.Controllers
{
    /// <summary>
    /// The query database controller.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]

    public class QueryDatabaseController : Controller
    {
        /// <summary>
        /// Post a list of bsondocuments.
        /// </summary>
        /// <returns><![CDATA[A List<BsonDocument>.]]></returns>
        [HttpPost]
        public List<BsonDocument> Post()
        // public void Post()
        {
            var dbClient = new MongoClient("mongodb://localhost:27017");
            var dbList = dbClient.ListDatabases().ToList();
            IMongoDatabase db = dbClient.GetDatabase("BD_Radical");
            var abaques = db.GetCollection<BsonDocument>("Abaques");
            var builder = Builders<BsonDocument>.Filter;
            var filter = builder.Eq("Inclinaison_de_flamme", 25) & builder.Eq("Humidite", 20) & builder.Eq("Longueur_de_flamme", 4);

            var docs = abaques.Find(filter).Project(Builders<BsonDocument>.Projection.Include("ISOFLUX")).Limit(1).ToList();
            docs.ForEach(doc =>
            {
                Console.WriteLine(doc);
            });

            var newList = new List<BsonDocument>();
            newList = docs;
            return newList;
        }
    }
}
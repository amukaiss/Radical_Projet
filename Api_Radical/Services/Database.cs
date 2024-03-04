using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ApiTest01.Services
{
    /// <summary>
    /// The abaque.
    /// </summary>
    public class Abaque
    {
        /// <summary>
        /// Gets or Sets the id.
        /// </summary>
        public int _id { get; set; }
        /// <summary>
        /// Gets or Sets the name.
        /// </summary>
        public string name { get; set; }
        /// <summary>
        /// Gets or Sets the longueurdeflamme.
        /// </summary>
        public double Longueur_de_flamme { get; set; }
        /// <summary>
        /// Gets or Sets the rayondeflamme.
        /// </summary>
        public double Rayon_de_flamme { get; set; }
        /// <summary>
        /// Gets or Sets the inclinaisondeflamme.
        /// </summary>
        public double Inclinaison_de_flamme { get; set; }
        /// <summary>
        /// Gets or Sets the humidite.
        /// </summary>
        public double Humidite { get; set; }
        /// <summary>
        /// Gets or Sets the ISOFLUX.
        /// </summary>
        public Array ISOFLUX { get; set; }

}
    /// <summary>
    /// The database.
    /// </summary>
    public class Database
    {


        /// <summary>
        /// Cherchers a list of bsondocuments.
        /// </summary>
        /// <param name="lon">The lon.</param>
        /// <param name="ra">The ra.</param>
        /// <param name="inc">The inc.</param>
        /// <param name="humi">The humi.</param>
        /// <param name="temp">The temp.</param>
        /// <returns><![CDATA[A List<BsonDocument>.]]></returns>
        public List<BsonDocument> chercher(double lon, double ra, double inc, double humi, double temp)
        {
            var dbClient = new MongoClient("mongodb://localhost:27017");
            IMongoDatabase db = dbClient.GetDatabase("BD_Radical");

            var elli = db.GetCollection<BsonDocument>("Abaques2");
            var builder = Builders<BsonDocument>.Filter;
            var projection = Builders<Abaque>.Projection.Exclude(u => u._id).Include(u => u.ISOFLUX);
            var filter = builder.Eq("Humidite", humi) & builder.Eq("Rayon_de_flamme", ra) & builder.Lte("Longueur_de_flamme", lon) & builder.Eq("Inclinaison_de_flamme", inc);
            var sortDefinition = Builders<BsonDocument>.Sort.Descending("Longueur_de_flamme");
            var docs = elli.Find(filter).Sort(sortDefinition).Limit(1).ToList();

            return docs;
        }

    }
}

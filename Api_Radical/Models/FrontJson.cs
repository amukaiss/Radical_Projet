using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// The front json.
    /// </summary>
    public class FrontJson
    {
        /// <summary>
        /// Gets or Sets the type.
        /// </summary>
        public string type { get; set; }
        /// <summary>
        /// Gets or Sets the features.
        /// </summary>
        public Feature[] features { get; set; }
    }
    /// <summary>
    /// The feature.
    /// </summary>
    public class Feature
    {
        /// <summary>
        /// Gets or Sets the type.
        /// </summary>
        public string type { get; set; }
        /// <summary>
        /// Gets or Sets the geometry.
        /// </summary>
        public Geometry geometry { get; set; }
        /// <summary>
        /// Gets or Sets the properties.
        /// </summary>
        public Properties properties { get; set; }
    }

    /// <summary>
    /// The geometry.
    /// </summary>
    public class Geometry
    {
        /// <summary>
        /// Gets or Sets the type.
        /// </summary>
        public string type { get; set; }
        /// <summary>
        /// Gets or Sets the coordinates.
        /// </summary>
        public float[,] coordinates { get; set; }
    }

    /// <summary>
    /// The properties.
    /// </summary>
    public class Properties
    {
        /// <summary>
        /// Gets or Sets the niv3 14.
        /// </summary>
        public int NIV3_14 { get; set; }
        /*
        public int Id { get; set; }
        public int NIV1_14 { get; set; }
        public string LIB1_14 { get; set; }
        public int NIV2_14 { get; set; }
        public string LIB2_14 { get; set; }
        public int NIV3_14 { get; set; }
        public string LIB3_14 { get; set; }
        public float Area_m2 { get; set; }
        public float Area_ha { get; set; }
        public string Donnee_exo { get; set; }
        public string DOUTE_14 { get; set; }
        */
    }
}

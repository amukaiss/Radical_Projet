using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// The line front.
    /// </summary>
    public class LineFront
    {
        /// <summary>
        /// Gets or Sets the type.
        /// </summary>
        public string type { get; set; }
        /// <summary>
        /// Gets or Sets the geometry.
        /// </summary>
        public Geometry3 geometry { get; set; }
        /// <summary>
        /// Gets or Sets the properties.
        /// </summary>
        public Properties3 properties { get; set; }
    }

    /// <summary>
    /// The geometry3.
    /// </summary>
    public class Geometry3
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
    /// The properties3.
    /// </summary>
    public class Properties3
    {
        /// <summary>
        /// Gets or Sets the niv3 14.
        /// </summary>
        public int NIV3_14 { get; set; }
    }

}

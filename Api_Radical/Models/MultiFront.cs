using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// The multi front.
    /// </summary>
    public class MultiFront
    {
        /// <summary>
        /// Gets or Sets the type.
        /// </summary>
        public string type { get; set; }
        /// <summary>
        /// Gets or Sets the geometry.
        /// </summary>
        public Geometry2 geometry { get; set; }
        /// <summary>
        /// Gets or Sets the properties.
        /// </summary>
        public Properties2 properties { get; set; }
    }

    /// <summary>
    /// The geometry2.
    /// </summary>
    public class Geometry2
    {
        /// <summary>
        /// Gets or Sets the type.
        /// </summary>
        public string type { get; set; }
        /// <summary>
        /// Gets or Sets the coordinates.
        /// </summary>
        public float[][,] coordinates { get; set; }
    }

    /// <summary>
    /// The properties2.
    /// </summary>
    public class Properties2
    {
        /// <summary>
        /// Gets or Sets the niv3 14.
        /// </summary>
        public int NIV3_14 { get; set; }
    }

}

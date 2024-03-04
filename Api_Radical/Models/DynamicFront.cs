using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// The dynamic front.
    /// </summary>
    public class DynamicFront
    {
        /// <summary>
        /// Gets or Sets the type.
        /// </summary>
        public string type { get; set; }
        /// <summary>
        /// Gets or Sets the features.
        /// </summary>
        public string features { get; set; }
        /// <summary>
        /// Gets or Sets the geometry.
        /// </summary>
        public string geometry { get; set; }
        /// <summary>
        /// Gets or Sets the coordinates.
        /// </summary>
        public string coordinates { get; set; }
        /// <summary>
        /// Gets or Sets the properties.
        /// </summary>
        public string properties { get; set; }
    }
}

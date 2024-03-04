using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// Classe Abaque qui fait appel à la classe Isoflux
    /// </summary>
    public class Abaque
    {
        /// <summary>
        /// Gets or Sets the ISOFLUX.
        /// </summary>
        public ISOFLUX[][] ISOFLUX { get; set; }
    }

    /// <summary>
    /// Classe des isoflux 
    /// </summary>
    public class ISOFLUX
    {
        /// <summary>
        /// Gets or Sets the iso.
        /// </summary>
        public float iso { get; set; }
        /// <summary>
        /// Gets or Sets the ellipse.
        /// </summary>
        public float[] Ellipse { get; set; }
    }

}

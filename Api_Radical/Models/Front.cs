using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// The front.
    /// </summary>
    public class Front
    {
        /// <summary>
        /// Gets or Sets the X.
        /// </summary>
        public Double[][] X { get; set; }
        /// <summary>
        /// Gets or Sets the Y.
        /// </summary>
        public Double[][] Y { get; set; }
        /// <summary>
        /// Gets or Sets the Z.
        /// </summary>
        public Double[][] Z { get; set; }
        /// <summary>
        /// Gets or Sets the xf.
        /// </summary>
        public List<double> xf { get; set; }
        /// <summary>
        /// Gets or Sets the yf.
        /// </summary>
        public List<double> yf { get; set; }
        /// <summary>
        /// Gets or Sets the zf.
        /// </summary>
        public Double[] zf { get; set; }
        /// <summary>
        /// Gets or Sets the oc.
        /// </summary>
        public List<int> oc { get; set; }

        /// <summary>
        /// Gets or Sets the normalf.
        /// </summary>
        public Array normalf { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Front"/> class.
        /// </summary>
        /// <param name="X">The X.</param>
        /// <param name="Y">The Y.</param>
        /// <param name="Z">The Z.</param>
        /// <param name="xf">The xf.</param>
        /// <param name="yf">The yf.</param>
        /// <param name="zf">The zf.</param>
        /// <param name="normalf">The normalf.</param>
        public Front(Double[][] X, Double[][] Y, Double[][] Z,List<double> xf, List<double> yf, Double[] zf, Array normalf)
        {
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.xf = xf;
            this.yf = yf;
            this.zf = zf;
            this.normalf = normalf;
        }
        /// <summary>
        /// Initializes a new instance of the <see cref="Front"/> class.
        /// </summary>
        /// <param name="normalf">The normalf.</param>
        public Front(Array normalf)
        {
            this.normalf = normalf;
        }

    }
}

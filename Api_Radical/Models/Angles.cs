using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// The angles.
    /// </summary>
    public class Angles
    {
        /// <summary>
        /// Gets or Sets the tab.
        /// </summary>
        public double[][] tab { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Angles"/> class.
        /// </summary>
        /// <param name="tab">The tab.</param>
        public Angles(double[][] tab)
        {
            this.tab = tab;
        }
    }
}

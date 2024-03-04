using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// The test.
    /// </summary>
    public class Test
    {
        /// <summary>
        /// Gets or Sets the list.
        /// </summary>
        public double[][] list { get; set; }
        /// <summary>
        /// Gets or Sets the l list.
        /// </summary>
        public List<double> lList { get; set; }


        /// <summary>
        /// Initializes a new instance of the <see cref="Test"/> class.
        /// </summary>
        /// <param name="list">The list.</param>
        public Test(double[][] list)
    {
        this.list = list;
    }
}
}

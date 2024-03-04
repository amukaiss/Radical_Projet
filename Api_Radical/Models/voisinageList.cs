using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// The voisinage list.
    /// </summary>
    public class voisinageList
    {
        /// <summary>
        /// Gets or Sets the xlist.
        /// </summary>
        public List<double> xlist { get; set; }
        /// <summary>
        /// Gets or Sets the ylist.
        /// </summary>
        public List<double> ylist { get; set; }
        /// <summary>
        /// Gets or Sets the zlist.
        /// </summary>
        public List<double> zlist { get; set; }
        /// <summary>
        /// Gets or Sets the nlist.
        /// </summary>
        public List<int> nlist { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="voisinageList"/> class.
        /// </summary>
        /// <param name="xlist">The xlist.</param>
        /// <param name="ylist">The ylist.</param>
        /// <param name="zlist">The zlist.</param>
        /// <param name="nlist">The nlist.</param>
        public voisinageList(List<double> xlist, List<double> ylist, List<double> zlist,List<int> nlist)
        {
            this.xlist = xlist;
            this.ylist = ylist;
            this.zlist = zlist;
            this.nlist = nlist;
        }
    }
}

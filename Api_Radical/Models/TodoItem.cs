using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// The todo item.
    /// </summary>
    public class TodoItem
    {
        /// <summary>
        /// Gets or Sets the id.
        /// </summary>
        public long Id { get; set; }
        /// <summary>
        /// Gets or Sets the name.
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// Gets or Sets a value indicating whether is complete.
        /// </summary>
        public bool IsComplete { get; set; }
    }
}

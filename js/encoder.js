/**
 * 
 * 
 *  Encoder
 *     Desc: Takes a graph and produces a spin config file
 * 
 * 
 */

/**
 * 
 *  GraphToFile
 *  Desc: Takes the graph and converts it to a downloadable file
 * 
 */
function graphToFile(){

    var outputStr = "";

    outputStr = addHeader(outputStr);

    //Add nodes to file string
    var nodeStr = nodesToString(cy);
    outputStr = outputStr.concat('# Sites\n',nodeStr.length.toString(),'\n', nodeStr.join('\n'), '\n');

    //Add Edges To file string
    var edgeStr = edgesToString(cy);
    outputStr = outputStr.concat('# Interactions\n', edgeStr[0].length.toString(),'\n', edgeStr[0].join('\n'),'\n');

    // Add Subs to file string
    outputStr = outputStr.concat('# Subsitutions\n',edgeStr[1].length.toString(),'\n', edgeStr[1].join('\n'),'\n');

    //Download File
    download("config.txt", outputStr);

}

/**
 * 
 *  NodesToString
 *  Desc: Takes a graph and returns an array of strings for each line in the file
 * 
 */
function nodesToString(graph){

    var output = [];

    graph.nodes().each(function(node) { // iterate through each node on the graph

        var data = node.data(); // get node data
        var line = ""; // define line

        line += "S" + data.name + " "; // name
        line += data["t-val"] + " "; // theta
        line += data["t-inc"] + " "; // theta incremator
        line += data["p-val"] + " "; // phi
        line += data["p-inc"] + " "; // phi incrementor
        line += data.x + " "; // x pos
        line += data.y; // y pos

        if (data.type == 0) output.push(line); // add line to output, only for actual nodes

    })

    return output;
}

/**
 * 
 *  EdgesToString
 *  Desc: Takes a graph and returns a 2D array of strings for each line in the file for interactions and subs
 * 
 */
function edgesToString(graph){
    
    var output = [];
    var subs = []

    graph.edges().each(function(edge) {

        var data = edge.data();
        var line = "";

        console.log(data);

        var src = graph.$('#' + data.source).data();
        var dst = graph.$('#' + data.target).data();

        console.log(src);
        console.log(dst);

        var edgeName = data.name
        var srcName = "S" + src.name
        var dstName = "S" + dst.name.split("-")[0]
        var xDist = dst.x - src.x
        var yDist = dst.y - src.y

        line += edgeName + " "
        line += srcName + " " // source
        line += dstName + " " // destination
        line += xDist + " " // x
        line += yDist + " " // y
        line += data.type // interaction type

        output.push(line);
        if (data.sub != "" ) subs.push(edgeName + " = " + data.sub)
        
    });

    return [output, subs]

}


/**
 * 
 *  Download
 *  Desc: Downloads a file locally without a server
 */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

/**
 * 
 *  Add Header
 *  Desc: Adds header for file to a string
 * 
 */
function addHeader(str){

    str = str.concat(`#
#
#   Configuration
#
#
`)

    return str

}

/**
 * 
 * 
 *  Change Save Function To Download File
 * 
 * 
 */

 document.addEventListener("keydown", function(e) {
    if (e.key === 's' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
      graphToFile()
    }
  }, false);
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
    var nodeStr = nodesToString();
    outputStr = outputStr.concat('# Sites\n',nodeStr.length.toString(),'\n', nodeStr.join('\n'), '\n');

    //Add Edges To file string
    var edgeStr = edgesToString();
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
function nodesToString(){

    var output = [];

    var data = nodes.get()

    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        var line = ""; // define line

        line += node["label"] + " "; // name
        line += node["theta"] + " "; // theta
        line += node["thetaInc"] + " "; // theta incremator
        line += node["phi"] + " "; // phi
        line += node["phiInc"] + " "; // phi incrementor
        line += (node["x"] / 250) + " "; // x pos
        line += (node["y"] / -250) + " "; // y pos
        line += 0;// z pos, not used in this viewer

        if (node["type"] == 0){
             output.push(line); // add line to output, only for actual nodes
        }
    }

    return output;
}

/**
 * 
 *  EdgesToString
 *  Desc: Takes a graph and returns a 2D array of strings for each line in the file for interactions and subs
 * 
 */
function edgesToString(){
    
    var output = [];
    var subs = []

    edges.forEach(function(edge) {

        var line = "";

        console.log(edge);

        var src = nodes.get(edge.from)
        var dst = nodes.get(edge.to)

        console.log(src);
        console.log(dst);

        var edgeName = edge.id
        var srcName = src.label
        var dstName = dst.label

        line += edgeName + " "
        line += srcName + " " // source
        line += (src.x / 250) + " "
        line += (src.y / -250) + " "
        line += 0 + " "
        line += dstName + " " // destination
        line += (dst.x / 250) +  " "
        line += (dst.y / -250) + " "
        line += 0 + " "
        line += edge.type // interaction type

        output.push(line);
        if (edge.label != "" ) subs.push(edgeName + " = " + edge.label)
        
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
#   aSpin Configuration
#   Created: ` + getFullTimestamp() + `
#   
#
#
`)

    return str

}

function getFullTimestamp () {
    const pad = (n,s=2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
    const d = new Date();
    
    return `${pad(d.getFullYear(),4)}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(),3)}`;
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
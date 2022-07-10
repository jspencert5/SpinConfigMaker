/**
 * 
 * 
 *      Decoder
 *      Desc: Takes in a configuration file and loads it into the graph
 * 
 * 
 */


/**
 * 
 *  Decode
 *  Desc: driving function for decoder
 * 
 */
function decode(){

    cy.elements().remove();

    var lines = getLines();
    if (lines == null) return; // user cancelled or did not enter anything

    var edges = []
    var subs = new Map()

    var sectionCount = 0
    for (let i = 0; i < lines.length; i++) {
        var sectionNum = lines[i];
        i++;
        for (let j = 0; j < sectionNum; j++) {
            var line = lines[i + j].split("#")[0].trim().split(" ");
            switch (sectionCount) {
                case 0: // add nodes
                    addNode({"name": line[0].substring(1), "t-val": line[1], "t-inc": line[2], "p-val": line[3], "p-inc": line[4], "x": line[5], "y": line[6]}, 0);
                    break;
                case 1: // add edges

                    var src = cy.$('#' + line[1]).data();
                    var dst = cy.$('#' + line[2]).data();

                    edges.push([line, src, dst])
                    
                    break;
                case 2: // add subs
                    subs[line[0]] = line[2]
                    break;
                default:
                    console.log("Error: Unknown Section while parsing");
                    break;
            }
        }
        i += sectionNum - 1;
        sectionCount++;
    }

    console.log(subs);

    // we need to add subs to edges, label issues will happen if we don't
    for (let i = 0; i < edges.length; i++) {
        var line = edges[i][0];
        var src = edges[i][1];
        var dst = edges[i][2];
        var name = genEdgeName(cy, src.name, dst.name)
        var data = { "name-src": src.name, "name-dst": dst.name, "x-src": src.x, "y-src": src.y, "x-dst": parseInt(src.x) + parseInt(line[3]), "y-dst": parseInt(src.y) + parseInt(line[4]), "i-type": line[5], "sub-val": subs[name] !== undefined ? subs[name] : ""}
        addEdge(data);
    }

}

/**
 * 
 * 
 *  getLines
 *  Desc: prompts user to paste in config file and returns array containing relvant info
 */
function getLines(){

    var modal = bootstrap.Modal.getInstance(document.getElementById('decodeModal'));

    modal.hide();

    var file = document.getElementById("decodeText").value;

    if (file == null || file == "") return null // nothing was enter or it was cancelled

    file = file.split("\n").filter(function(line) {
        return !(line.split(" ")[0].trim().substring(0,1) == "#" || line.trim().length == 0)
    })

    return file

}

/**
 * 
 * 
 *  Add Cmd-I for import
 * 
 */

 document.addEventListener("keydown", function(e) {
    if (e.key === 'i' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        
        navigator.clipboard.readText().then(text => {
            document.getElementById("decodeText").value = text
            var modal = new bootstrap.Modal(document.getElementById('decodeModal'), {
                keyboard: false
            })
            modal.show();
        })
        .catch(err => {
            console.error('Failed to read clipboard contents: ', err);
        });

    }
  }, false);
/* Bintree Constructor */
(function () {
    function Bintree(av, root, min, max) {

        this.t = av.ds.binarytree({nodegap: 25});
        this.t.layout();
        this.t.root(root);
        this.r = this.t.root();
        this.r.type = "leaf";
        this.t.layout();

        this.insertHelp = function(node, val, splitValue) {
            
            if (node.type === "leaf") 
            {
                var newInternal = this.t.newNode(-1);
                newInternal.type = "internal";

                this.insertHelp(newInternal, val, splitValue / 2);
                this.insertHelp(newInternal, node.value(), splitValue / 2);
            }
            else if (node.type === "internal")
            {

            } 
            else // we know its empty
            {    
                return this.t.newNode(val);
            }
        };

        this.removeHelp = function(node, val) {
      
        };

        this.insert = function(val) {
            // check if valid bounds
            if (val < min || val > max) {
                return undefined;
            }

            this.r = this.insertHelp(this.r, val, max / 2);
        }

        this.remove = function(val) {

        };

        this.layout = function() {
            this.t.layout();
        };
    }

    var tree = {};
    tree.Bintree = Bintree;
    window.tree = tree;
}());

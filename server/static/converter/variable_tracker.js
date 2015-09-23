
function VariableTracker() {
    this.variables = {};
}

VariableTracker.prototype.set(name, new_type) {
    if (name in this.variables) {
        if (!this.variables[name].has_been_read) {
            // Unused set
        }
        
        // Add this new_type to the set of types it could be
        
    } else {
        // New variable!
    }
}

VariableTracker.prototype.read(name) {
    if (name in this.variables) {
        this.variables[name].has_been_read = true;
    } else {
        // Unset read
    }
}
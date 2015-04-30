// Conctructor function.
function MeasuremanModel() {
    "use strict";
    this.lines_ = new Array();
    this.point_angle_map_ = {};  // points to lines originating from it.
    this.current_line_ = undefined;
    this.current_angle_ = undefined;
     
    this.boxes_ = new Array();
    this.current_box_ = undefined;

    // -- editing operation. We start a line and eventually commit or forget it.

    // Start a new line but does not add it to the model yet.
    this.startEditLine = function(x, y) {
	var line = new Line(x, y, x, y);
	this.current_line_ = line;
	this.current_angle_ = this.addAngle(line.p1, line.p2, line);
    }
    this.hasEditLine = function() { return this.current_line_ != undefined; }
    this.getEditLine = function() { return this.current_line_; }
    this.updateEditLine = function(x, y) {
		if (this.current_line_ == undefined) return;
		this.current_line_.updatePos(x, y);
		this.current_angle_.notifyPointsChanged();
		return this.current_line_;
    }

	//determine where to snap, horizontal or vertical Sectors
	this.getSector = function() {
		var line = this.current_line_;
		var a = new Angle(line.p1, line.p2, line);
			
		if((a.angle >= Math.PI/4 && a.angle <= 3 * Math.PI/4)){ return "N"; } 
		else if((a.angle > 3 * Math.PI/4 && a.angle <= 5 * Math.PI/4)){ return "W"; } 
		else if((a.angle > 5 * Math.PI/4 && a.angle <= 7 * Math.PI/4)){ return "S"; } 
		else if((a.angle >= 0 && a.angle < Math.PI/4) || (a.angle > 7 * Math.PI/4 && a.angle < Math.PI*2)){ return "O"; } 
		else{
			return "X";
		}		
	}

    this.commitEditLine = function() {
		var line = this.current_line_;
					
		this.lines_[this.lines_.length] = line;
		this.addAngle(line.p2, line.p1, line);
		this.current_line_ = undefined;
    }
    this.forgetEditLine = function() {
		if (this.current_line_ == undefined)
		    return;
		this.removeAngle(this.current_line_.p1, this.current_line_);
		this.current_line_ = undefined;
    }

    this.addAngle = function(center, p2, line) {
		var key = center.get_key();
		var angle_list = this.point_angle_map_[key];
		if (angle_list === undefined) {
		    angle_list = new Array();
		    this.point_angle_map_[key] = angle_list;
		}
		var angle = new Angle(center, p2, line);
		angle_list[angle_list.length] = angle;
		return angle;
    }

    this.removeAngle = function(center_point, line) {
		var key = center_point.get_key();
		var angle_list = this.point_angle_map_[key];
		if (angle_list === undefined) return; // shrug.
		var pos = -1;
		for (var i = 0; i < angle_list.length; ++i) {
		    if (angle_list[i].line == line) {
			pos = i;
			break;
		    }
		}
		if (pos >= 0) {
		    angle_list.splice(pos, 1);
		}
    }

    // Remove a line
    this.removeLine = function(line) {
		var pos = this.lines_.indexOf(line);
		if (pos < 0) alert("Should not happen: Removed non-existent line");
		this.lines_.splice(pos, 1);
    }

    // Find the closest line to the given coordinate or 'undefined', if they
    // are all too remote.
    this.findClosestLine = function(x, y) {
		var smallest_distance = undefined;
		var selected_line = undefined;
		this.forAllLines(function(line) {
		    var this_distance = line.distanceToCenter(x, y);
		    if (smallest_distance == undefined
			|| this_distance < smallest_distance) {
			smallest_distance = this_distance;
			selected_line = line;
		    }
		})
		if (selected_line && smallest_distance < 50) {
		    return selected_line;
		}
		return undefined;
    }

    // Iterate over all lines; Callback needs to accept a line.
    this.forAllLines = function(cb) {
		for (var i = 0; i < this.lines_.length; ++i) {
		    cb(this.lines_[i]);
		}
    }

    this.forAllArcs = function(cb) {
		for (var key in this.point_angle_map_) {
		    if (!this.point_angle_map_.hasOwnProperty(key))
			continue;
		    var angle_list = this.point_angle_map_[key];
		    if (angle_list.length < 2)
			continue;
		    angle_list.sort(function(a, b) {
			return a.angle - b.angle;
		    });
		    for (var i = 0; i < angle_list.length; ++i) {
			var a = angle_list[i], b = angle_list[(i+1) % angle_list.length];
			if (!a.is_valid || !b.is_valid)
			    continue;
			var arc = new Arc(a, b);
			if (arc.angleInDegrees() >= 180.0)
			    continue;
			cb(arc)
		    }
		}
    }
    
    
    // BOX
   

    // -- editing operation. We start a line and eventually commit or forget it.

    // Start a new line but does not add it to the model yet.
    this.startEditBox = function(x, y) {
		var box = new Box(x, y, x, y);
		this.current_box_ = box;
	
    }
    this.hasEditBox = function() { return this.current_box_ != undefined; }
    this.getEditBox = function() { return this.current_box_; }
    this.updateEditBox = function(x, y) {
		if (this.current_box_ == undefined) return;
		this.current_box_.updatePos(x, y);
		return this.current_box_;
    }

    this.commitEditBox = function() {
		var box = this.current_box_;
		this.boxes_[this.boxes_.length] = box;
		this.current_box_ = undefined;
    }
    this.forgetEditBox = function() {
		if (this.current_box_ == undefined)
		    return;
		this.current_box_ = undefined;
    }
 
    
    // Remove a line
    this.removeBox = function(box) {
		var pos = this.boxes_.indexOf(box);
		if (pos < 0) alert("Should not happen: Removed non-existent line");
		this.boxes_.splice(pos, 1);
    }

    // Find the closest line to the given coordinate or 'undefined', if they
    // are all too remote.
    this.findClosestBox = function(x, y) {
	    
	    console.log("find closest box")
	    
		var smallest_distance = undefined;
		var selected_box = undefined;
		this.forAllBoxes(function(box) {
						
			if(x >= box.p1.x && x <= box.p1.x + box.width()){
								
				if(y > box.p1.y && y < box.p1.y + box.height()){
										
					selected_box = box;
				}
				
			}
			
					   	
		})
		if (selected_box) {
		    return selected_box;
		}
		return undefined;
    }

    // Iterate over all lines; Callback needs to accept a line.
    this.forAllBoxes = function(cb) {
		for (var i = 0; i < this.boxes_.length; ++i) {
		    cb(this.boxes_[i]);
		}
    }
    
    
    //export Arrays for external view
    
    this.exportLines = function(){
	    
	    var linedata = JSON.stringify(this.lines_);
	    return linedata;
	    
    }
    
    this.exportBoxes = function(){
	    
	    var boxarray = this.boxes_;
	    return boxarray;
	    
    }

}

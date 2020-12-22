
if (!window.A4J) { window.A4J= {};}

function _JSFFormSubmit(linkId,formName,target,parameters){
	var form = document.getElementById(formName);
	if(form){
		var hiddenField = form.elements[formName+":_idcl"];
		if(hiddenField){
			hiddenField.value=linkId;
	    } else {
			var input = document.createElement("input");
			input.type="hidden";
			input.name=formName+":_idcl";
			input.value=linkId;
			form.appendChild(input);
		}
		if(target){
			form.target=target;
		}
		if(parameters){
			for(var param in parameters){
				if(form.elements[param]){
					form.elements[param].value = parameters[param];
				} else {
					var input = document.createElement("input");
					input.type="hidden";
					input.name=param;
					input.value=parameters[param];
					form.appendChild(input);
				}
			}
		}
		form.submit();
	} else {
		alert("Form "+formName+" not found in document");
	}
	return false;
};

function _clearJSFFormParameters(formName,target,fields){
	var form = document.getElementById(formName);
	if(form){
		if(target){
			form.target = target;
		} else {
			form.target = '';
		}
		if(fields){
		 for(var i=0;i<fields.length;i++){
			var field = form.elements[fields[i]];
			if(field){
				field.value='';
			}
		 }
		}
	}
}

function clearFormHiddenParams(formName,target,fields){
	_clearJSFFormParameters(formName,target,fields);
}

A4J.findForm = function(element){
	var parent = element;
	do{
		parent = parent.parentNode;
	} while (parent && parent.nodeName.toLowerCase() != 'form');
	if(!parent){
		parent = {reset:function(){}, submit:function(){}};
	}
	return parent;
}
//
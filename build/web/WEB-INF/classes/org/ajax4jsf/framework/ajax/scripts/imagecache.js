if (!Exadel) var Exadel = {};

Exadel.setImages =
	function (element, images) {
		element = $(element);
		if (!element) return;
		for(imageSrc in images){
			if(typeof imageSrc != 'function'){
				element[imageSrc] = new Image();
				element[imageSrc].src = images[imageSrc];
			}
		}
	}

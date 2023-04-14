function myAlert(text,titolo){
	var titolo= titolo || "Attenzione!";
	var modal = document.getElementById('myAlert');
    	modal.style.display = "block";
    	document.getElementById('myAlert-text').innerHTML=text;
    	document.getElementById('myAlert-titolo').innerHTML=titolo;
}

function myConfirm(text, titolo, callback, callback2){
	var titolo= titolo || "Attenzione!";
	var modal = document.getElementById('myConfirm');
    	modal.style.display = "block";
    	document.getElementById('myConfirm-text').innerHTML=text;
		document.getElementById('myConfirm-titolo').innerHTML=titolo;
	
	document.getElementById("myConfirm-button").onclick = function(event){
		let modal = document.getElementById('myConfirm');
		modal.style.display = 'none';
		if(callback) callback();
	}

	document.getElementById("myConfirm-button2").onclick = function(event){
		writing = false;
		
		var modal = document.getElementById('myConfirm');
		modal.style.display = 'none';
		if(callback2) callback2();
	}
}

function myPrompt(text, titolo, callback, callback2){

	var modal = document.getElementById('myPrompt');
    	modal.style.display = "block";
    	document.getElementById('myPrompt-text').innerHTML=text;
		document.getElementById('myPrompt-titolo').innerHTML=titolo;
	
	document.getElementById("myPrompt-button").onclick = function(event){
		let t = document.getElementById("myPrompt-bar").value;

		if(t!=""){
			let modal = document.getElementById('myPrompt');
			modal.style.display = 'none';
			document.getElementById("myPrompt-bar").value = "";
			
			if(callback) callback(t);
		}
	}

	document.getElementById("myPrompt-button2").onclick = function(event){
		writing = false;
		
		var modal = document.getElementById('myPrompt');
		modal.style.display = 'none';
		if(callback2) callback2();
	}
}

function overTooltip(event, text){
	var x = event.clientX;
	var y = event.clientY;
	var tool=document.getElementById("tooltip");
	tool.style.top=y+10;
	tool.style.left=x+10;
	tool.style.display="block";
	tool.innerHTML=text;
}

function clearTooltip(){
	var tool=document.getElementById("tooltip");
	tool.style.display="none";
}

function atrTooltip(elem,text){
	elem.setAttribute("onmousemove", "overTooltip(event,'"+text+"')");
	elem.setAttribute("onmouseout", "clearTooltip()");
}
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<title>Review</title>
		 <link rel="stylesheet" href="style.css">
	</head>
	<body>
            <div class="topnav">
  <a class="active" href="index.jsp">Home</a>
  <a href="login.jsp">Login</a>
  <a href="review.jsp">Review</a>
  <a href="product.jsp">Products</a>
</div>
		<div class="container-fluid">
			<div class="panel-primary">
				<div class="panel-heading">
					<h1 class="panel-title">Thanks for your valuable review</h1>
				</div>
				<div class="panel-body">
					<div class="clearfix"></div>
					<div class="form-group col-md-4">
						<label>YOUR EMAIL</label>
						<input class ="form-control" type="email" name="email" id="email" required="required">
					</div>

					<div class="form-group col-md-4">
						<label>YOUR COMMENT</label>
						<textarea class="form-control" rows="8" id="comment" required="required"></textarea>
					</div>
					<div class="clearfix"></div>
					<div class="form-group col-md-6">
						<button class="btn btn-primary" type="button" onclick="loadAjax()">POST</button>
					</div>
				</div>
			</div>
			<p id="print"></p>
		</div>
		<script src="js/jquery.min.js"></script>
		<script src="js/bootstrap.js"></script>
		<script type="text/javascript">

		function loadAjax(){
			var email= document.getElementById("email").value;
			var comment= document.getElementById("comment").value;
			if(email.trim()==""|| comment.trim()==""){
			alert("All fields are Required");
			return false;
			}

			
			var url="ajaxRequestPage.jsp?"+"&comment="+comment+"&email="+email;



			if(window.XMLHttpRequest){
				
				request = new XMLHttpRequest();
				
			}else if(window.ActiveXObject){
				
				request = new ActiveXObject("Microsoft.XMLHTTP");
			}			
			try{
				request.onreadystatechange=sendInfo;
				request.open("POST",url,true);
				request.send();
				
			}catch(e){
			document.write(e);
			}			
		}

		function sendInfo(){
			var p =		document.getElementById("print");

			if(request.readyState ==1){
				var text = request.responseText;
				p.innerHTML="Please Wait...";
				console.log("1");
			}

			if(request.readyState ==2){
				var text = request.responseText;
				console.log("2");				
			}
			if(request.readyState ==3){
				var text = request.responseText;
				console.log("3");				
			}
			if(request.readyState ==4){
				var text = request.responseText;
				p.innerHTML=" Your Comment has been Posted  "+text;
			}
		}
		</script>
                <form action="Logout">
        <input type="submit" value="Logout">
    </form>
	</body>
</html>
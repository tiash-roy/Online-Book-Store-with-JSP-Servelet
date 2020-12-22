<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1" import ="java.sql.*"%>

<html>
	<head>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
	<title>AJAX REQUEST</title>
	<link rel="stylesheet" href="css/bootstrap.css">
	</head>
	<body>
		<div class="container-fluid">
			<%
				String email =request.getParameter("email");
				String comment =request.getParameter("comment");
			%>
			<div class="panel-primary">
				<div class="panel-heading">
					<h4 class="panel-title">COMMENTS</h4>
				</div>
				<div class="panel-body">
					<%
					String message="";
					try {			
						Class.forName("com.mysql.jdbc.Driver");
						Connection con=DriverManager.getConnection("jdbc:mysql://localhost:3306/reviews","root","");	
						PreparedStatement ps = con.prepareStatement("INSERT INTO reviews VALUES(?,?)");
						ps.setString(1, email);
						ps.setString(2, comment);
						ps.executeUpdate();
						%>
						<strong>
						EMAIL IS : <%=email %><br>
						YOUR COMMENT :<%=comment %>
						</strong>
						<%con.close();
					}catch (Exception e) {
						System.out.println(e);		
					}
					%>
				</div>
			</div>
		</div>
		<script src="js/jquery-3.1.1.min.js"></script>
		<script src="js/bootstrap.js"></script>
	</body>
</html>
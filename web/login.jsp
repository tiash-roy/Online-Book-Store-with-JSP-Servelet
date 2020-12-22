<%-- 
    Document   : login
    Created on : Nov 22, 2020, 7:45:38 AM
    Author     : User
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Login</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body> 
        <div class="topnav">
  <a class="active" href="index.jsp">Home</a>
  <a href="login.jsp">Login</a>
  <a href="review.jsp">Review</a>
  <a href="product.jsp">Products</a>
</div>
        <form action="login" method="POST">
            <table align="center" border="2" width="1" cellspacing="1" size="100" style="width:400px">
                <tbody>
                    <tr>
                        <th align="right">Email Address</th>
                        <td><input type="text" name="email" value="" /></td>
                    </tr>
                    <tr>
                        <th align="right">Password</th>
                        <td><input type="password" name="password" value="" /></td>
                    </tr>
                    <tr>
                        <td colspan="2" align="right"><input type="submit" value="Submit" /></td>
                    </tr>
                </tbody>
            </table>
            
        </form>
        <%
      response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      %>
    </body>
    
</html>

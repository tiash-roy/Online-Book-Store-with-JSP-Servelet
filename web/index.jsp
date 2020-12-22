<%-- 
    Document   : index
    Created on : Nov 20, 2020, 11:23:49 AM
    Author     : User
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Online Book Shop</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <div class="topnav">
  <a class="active" href="index.jsp">Home</a>
  <a href="login.jsp">Login</a>

</div>
    <center><h1 color="Blue">Registration</h1></center>
   <form action="register" method="POST">
            <table align="center" border="2" width="1" cellspacing="1" style="width:400px">
                <tbody>
                    <tr>
                        <th align="right">Name</th>
                        <td><input type="text" name="user_name" value="" size="50" /></td>
                    </tr>
                    <tr>
                        <th align="right">Email</th>
                        <td><input type="text" name="email" value="" size="50" /></td>
                    </tr>
                    <tr>
                        <th align="right">password</th>
                        <td><input type="password" name="password" value="" size="60" /></td>
                    </tr>
                    <tr>
                        <th align="right">Age</th>
                        <td><input type="text" name="age" value="" /></td>
                    </tr>
                    <tr>
                        <th align="right">Gender</th>
                        <td><select name="gender">
                                <option>Male</option>
                                <option>Female</option>
                            </select></td>
                    </tr>
                    <tr>
                        <td colspan="2" align="right"><input type="submit" value="Submit" /></td>
                    </tr>
                </tbody>
            </table>
        </form>
    </body>
</html>

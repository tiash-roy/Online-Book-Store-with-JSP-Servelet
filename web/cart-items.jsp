<%-- 
    Document   : cart-items
    Created on : Dec 5, 2020, 8:41:44 PM
    Author     : User
--%>

<%@page import="java.sql.Connection"%>
<%@page import="product.products"%>
<%@page import="product.productDao"%>
<%@page import="java.util.ListIterator"%>
<%@page import="java.util.List"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Shopping Cart</title>
    </head>
    <body>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>#</th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Cost</th>
                </tr>
            </thead>
        <%
            if(session.getAttribute("addTooCart")!=null){               
                ListIterator lit = ((List)session.getAttribute("addToCart")).listIterator();
                productDao pdo = new productDao(MyConnection.connectTo());
                int a =0;
                int total =0;
                while(lit.hasNext()){
                    a++;
                    int id = Integer.parseInt((String) lit.next());
                    products p = pdo.getOne(id);
                    total+=p.getCost();
                    %>
                    <tr>
                        <td><%= a %></td>
                        <td><%= p.getId() %></td>
                        <td><%= p.getTitle() %></td>
                        <td><%= p.getCost() %></td>
                    </tr>
                    <%
                }
                    %>
                    <tr>
                        <td colspan="3"><%= total%></td>
                    </tr>
                    <%
            }
        %>
        </table>
    </body>
</html>

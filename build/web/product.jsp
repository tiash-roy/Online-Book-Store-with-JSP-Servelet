<%-- 
    Document   : product
    Created on : Dec 2, 2020, 12:53:16 PM
    Author     : User
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
 <link rel="stylesheet" href="style.css">
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>JSP Page</title>
    </head>
    <body>
        <div class="topnav">
  <a class="active" href="index.jsp">Home</a>
  <a href="login.jsp">Login</a>
  <a href="review.jsp">Review</a>
  <a href="product.jsp">Products</a>
</div>
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/css/bootstrap.min.css" rel="stylesheet" />
<h2>Choose your books</h2>
<p>Add your favorites books to the cart</p>

<div class="header">
  <h2>Book Store</h2>
</div>
<main>

  <div class="container-fluid">
    <div class="row">

      <div class="col-sm-4">

        <div class="card">
          <img class="card-img-top img-fluid" src="foundation.jpg" width = "750" height="325" alt="Card image cap">
          <div class="card-block">
            <h4 class="card-title">Foundation</h4>
            <p class="card-text">The Foundation series is a science fiction book series written by American author Isaac Asimov. First published as a series of short stories in 1942–50, and subsequently in three collections in 1951–53, for thirty years the series was a trilogy: Foundation, Foundation and Empire, and Second Foundation.</p>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Isac Asimov</li>
            <li class="list-group-item">196$</li>
          </ul>
          <div class="card-block">
            <a href="cart-items.jsp" class="cart-items.jsp">Add to cart</a>
          </div>
        </div>

      </div>
      <div class="col-sm-4">
        <div class="card">
          <img class="card-img-top img-fluid" src="dune.jpg" width = "750" height="325" alt="Card image cap">
          <div class="card-block">
            <h4 class="card-title">Dune</h4>
            <p class="card-text">Paul Atreides leads nomadic tribes in a battle to control the desert planet Arrakis.</p>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Frank Herbert</li>
            <li class="list-group-item">122$</li>
          </ul>
          <div class="card-block">
            <a href="cart-items.jsp" class="card-link">Add to cart</a>
          </div>
        </div>

      </div>

      <div class="col-sm-4">

        <div class="card">
          <img class="card-img-top img-fluid" src="vinci.jpg" class = "img-responsive" width = "680" height="280" alt="Card image cap">
          <div class="card-block">
            <h4 class="card-title">The Vinci Code</h4>
            <p class="card-text">Symbologist Robert Langdon travels from Paris to London to unravel a bizarre murder. Accompanied by a cryptographer, he soon comes across a religious enigma protected by an age-old secret society.</p>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Dan Brown</li>
            <li class="list-group-item">120$</li>
          </ul>
          <div class="card-block">
            <a href="cart-items.jsp" class="card-link">Add to cart</a>
          </div>
        </div>

      </div>
    </div>
  </div>
    <form action="Logout">
        <input type="submit" value="Logout">
    </form>
  <%
      response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      %>

</main>
    </body>
</html>

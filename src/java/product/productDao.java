package product;


import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author User
 */
public class productDao {
    Connection con;
    public productDao(Connection con){
        this.con = con;
    }
    public products getOne(int id) throws SQLException, ClassNotFoundException {
        String sql = "select * from books where id="+id;
        Class.forName("com.mysql.jdbc.Driver");
        Connection con = DriverManager.getConnection("jdbc:mysql://localhost/books?", "root", "");
        try {
        Statement st=con.createStatement();
        ResultSet res = st.executeQuery(sql);
        products p = new products();
        while(res.next()){
            
            p.setId(res.getString("id"));
            p.setAuthor(res.getString("author"));
            p.setTitle(res.getString("title"));
            p.setCost(res.getInt("cost"));
        }
        return p;
        }
        catch (Exception ex){
            System.out.println(ex);
        }
        return null;
        
    }
    
}

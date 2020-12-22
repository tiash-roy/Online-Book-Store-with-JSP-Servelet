
package login;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Scanner;



/**
 *
 * @author User
 */
public class loginDao {
    String sql = "SELECT * FROM users WHERE Email=? and Password=?";
     boolean check(String email, String password) throws SQLException, ClassNotFoundException{
        //throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        try {
        Class.forName("com.mysql.jdbc.Driver");
        Connection con = DriverManager.getConnection("jdbc:mysql://localhost/users?", "root", "");
        Statement st = con.createStatement();
        PreparedStatement ps = con.prepareStatement(sql);
        ps.setString(1, email);
        ps.setString(2, password);
        ResultSet rs = ps.executeQuery();
         if(rs.next() == true){
            return true;
        }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}
 


   

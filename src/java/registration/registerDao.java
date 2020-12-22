package registration;


import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Scanner;

public class registerDao {

    
    public String insert(registerMember member) throws ClassNotFoundException, SQLException{
        Class.forName("com.mysql.jdbc.Driver");
        Connection con = DriverManager.getConnection("jdbc:mysql//localhost/users?", "root", "");
        Statement st = con.createStatement();
        PreparedStatement ps = con.prepareStatement("INSERT INTO users (Name,Email,Password,Age,Gender) VALUES (?,?,?,?,?)");
        ps.setString(1, member.getUser_name());
        ps.setString(2, member.getEmail());
        ps.setString(3, member.getPassword());
        ps.setString(4, member.getAge());
        ps.setString(5, member.getGender());
        ps.executeUpdate();
        return "Registration Complete";
    }
    
}

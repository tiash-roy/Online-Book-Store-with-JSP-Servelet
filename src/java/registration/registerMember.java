package registration;


public class registerMember {
    private String user_name,email,password,age,gender;

    public registerMember() {
        super();
    }

    public registerMember(String user_name, String email, String password, String age, String gender) {
        this.user_name = user_name;
        this.email = email;
        this.password = password;
        this.age = age;
        this.gender = gender;
    }

    public String getUser_name() {
        return user_name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getAge() {
        return age;
    }

    public String getGender() {
        return gender;
    }

    public void setUser_name(String user_name) {
        this.user_name = user_name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setAge(String age) {
        this.age = age;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
    
    
}

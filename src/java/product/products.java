package product;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author User
 */
public class products {
    private String title,author,id;
    int cost;

    public products() {
        super();
    }
    

    public products(String ttile, String author, String id, int cost) {
        this.title = ttile;
        this.author = author;
        this.id = id;
        this.cost = cost;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getId() {
        return id;
    }

    public int getCost() {
        return cost;
    }

    public void setTitle(String ttile) {
        this.title = title;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setCost(int cost) {
        this.cost = cost;
    }
    
    
    
    
}

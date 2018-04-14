var mysql = require("mysql");
var inquirer = require("inquirer");

// establishing a connection with mysql
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon_db"
});

// using connection to connect
connection.connect(function (err) {
    if (err) throw err;

    promptUser();

})

function promptUser() {
    // need to show everything on table except quantities
    var queryAllProducts = "select product_id, name, department, price from products"
    connection.query(queryAllProducts, function (error, products) {
        if (error) throw error;

        // looping through products and displaying them in terminal
        console.log("*********************");
        console.log("Current Inventory");
        console.log("*********************");
        console.log("Product ID" + "\t" + "Product Name" + "\t" + "Department" + "\t" + "Unit Price (USD)");
        for (var index = 0; index < products.length; index++) {
            var product = products[index];
            console.log(product.product_id + "\t\t" + product.name + "\t\t" + product.department + "\t\t" + product.price);
        }

        //interact with user ask the ID of the product they would like to buy
        inquirer
            .prompt([
                {
                    type: "input",
                    message: "What item ID would you like to purchase?",
                    name: "product_id"
                },
                {
                    type: "input",
                    message: "How many would you like to purchase? To quit enter X.",
                    name: "quantity"
                }
            ])
            .then(function (inquirerResponse) {

                if (inquirerResponse.product_id === "X" || inquirerResponse.quantity === "X") {
                    // ends connection so it doesn't run forever
                    return connection.end();
                }

                var productSelection = inquirerResponse.product_id;
                var quantitySelection = inquirerResponse.quantity;

                var querySelectedProduct = "select price, quantity from products where product_id = " + productSelection;
                connection.query(querySelectedProduct, function (error, product) {
                    if (error) throw error;

                    var currentQuantity = product[0].quantity;
                    var currentPrice = product[0].price;

                    if (quantitySelection <= currentQuantity) {

                        var newProductQuantity = currentQuantity - quantitySelection;

                        var updateProductsQuery = "update products set quantity = " + newProductQuantity + " where product_id = " + productSelection;

                        connection.query(updateProductsQuery, function (error, results) {
                            if (error) throw error;
                            console.log("Thanks for your business. Your total cost is $" + (currentPrice * quantitySelection) + "\n");
                            promptUser();
                        })
                    } else {
                        console.log("Insufficient quantity! Try again.");
                        promptUser();
                    }
                })
            })
    });
}
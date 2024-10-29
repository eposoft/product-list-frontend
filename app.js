// Initialize an empty object to hold the product to be edited
let editProduct = {};

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

// Function to search products
function searchProducts() {
    const query = document.getElementById('searchQuery').value;
    const url = query ? `https://eposoft-product.onrender.com/products?query=${query}` : 'https://eposoft-product.onrender.com/products';

    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => displayProducts(data))
    .catch(() => alert('Error fetching products'));
}



// Function to open the edit modal with existing product details, when edit button is clicked
function openEditModal(product) {
    editProduct = { ...product }; // Copy product data for editing
    document.getElementById('editProductName').value = product.productName;
    document.getElementById('editPartNumber').value = product.partNumber;
    document.getElementById('editManufacturer').value = product.manufacturer;

    let priceHtml = '';
    for (let i = 0; i < 3; i++) {
        if (product.prices[i]) {
            priceHtml += `<div class="input-group mb-3">
                            <input type="number" class="form-control editPrice" value="${product.prices[i].price}" placeholder="Price ${i + 1}">
                            <input type="text" class="form-control editSupplier" value="${product.prices[i].supplier}" placeholder="Supplier ${i + 1}">
                          </div>`;
        } else {
            priceHtml += `<div class="input-group mb-3">
                            <input type="number" class="form-control editPrice" placeholder="Price ${i + 1}">
                            <input type="text" class="form-control editSupplier" placeholder="Supplier ${i + 1}">
                          </div>`;
        }
    }
    document.getElementById('editPriceContainer').innerHTML = priceHtml;

        // Use the Bootstrap Modal API to open the modal
        const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
        editModal.show();
    //new bootstrap.Modal(document.getElementById('editProductModal')).show();
}

// Function to update a product , when button Save Changes clicked
document.getElementById('updateProductBtn').addEventListener('click', function() {
    const updatedProduct = {
        productName: document.getElementById('editProductName').value,
        partNumber: document.getElementById('editPartNumber').value,
        manufacturer: document.getElementById('editManufacturer').value,
        prices: []
    };

    document.querySelectorAll('#editPriceContainer .input-group').forEach(function(group) {
        const price = group.querySelector('.editPrice').value;
        const supplier = group.querySelector('.editSupplier').value;
        if (price && supplier) {
            updatedProduct.prices.push({ price: parseFloat(price), supplier: supplier });
        }
    });

    fetch(`https://eposoft-product.onrender.com/products/${editProduct._id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
    })
    .then(() => {
         // Use the Bootstrap Modal API to close the modal
         const editModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
         editModal.hide();
        //new bootstrap.Modal(document.getElementById('editProductModal')).hide();
        searchProducts();
    })
    .catch(() => alert('Error updating product'));
});

// Function to delete a product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`https://eposoft-product.onrender.com/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => searchProducts())
        .catch(() => alert('Error deleting product'));
    }
}

// Function to add a new product
document.getElementById('addProductBtn').addEventListener('click', function() {
    const newProduct = {
        productName: document.getElementById('newProductName').value,
        partNumber: document.getElementById('newPartNumber').value,
        manufacturer: document.getElementById('newManufacturer').value,
        prices: []
    };

    document.querySelectorAll('#newPriceContainer .input-group').forEach(function(group) {
        const price = group.querySelector('input[type=number]').value;
        const supplier = group.querySelector('input[type=text]').value;
        if (price && supplier) {
            newProduct.prices.push({ price: parseFloat(price), supplier });
        }
    });

    fetch('https://eposoft-product.onrender.com/products', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    })
    .then(() => {

        const addModal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        addModal.hide();

        //new bootstrap.Modal(document.getElementById('addProductModal')).hide();
        searchProducts();
        resetAddProductForm();
    })
    .catch(() => alert('Error adding product'));
});

// Function to reset the add product form
function resetAddProductForm() {
    document.getElementById('newProductName').value = '';
    document.getElementById('newPartNumber').value = '';
    document.getElementById('newManufacturer').value = '';
    document.querySelectorAll('#newPriceContainer input').forEach(input => input.value = '');
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', searchProducts);

// Attach event listener to the search input for Enter key press
document.getElementById('searchQuery').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

// Perform initial search on page load
document.addEventListener('DOMContentLoaded', function() {
    searchProducts();
});



// -------------------------------------------------Pagination Functionality------------------------------------------------------//

let currentPage = 1;
const rowsPerPage = 10;
let totalProducts = [];


// Function to display products in table and card format based on screen size
function displayProducts(products) {
    // Display in table format for large screens
    let tableHtml = '';
    let cardHtml = '';

    products.forEach(product => {
        // Table format for large screens
        tableHtml += `<tr>
            <td>${product.productName}</td>
            <td>${product.partNumber}</td>
            <td>${product.manufacturer}</td>`;
        for (let i = 0; i < 3; i++) {
            if (product.prices[i]) {
                tableHtml += `<td>${product.prices[i].price}</td>
                             <td>${product.prices[i].supplier}</td>`;
            } else {
                tableHtml += `<td></td><td></td>`;
            }
        }
        tableHtml += `<td>
                        <button class="btn btn-warning" onclick='openEditModal(${JSON.stringify(product)})'>Edit</button>
                        <button class="btn btn-danger" onclick='deleteProduct("${product._id}")'>Del</button>
                     </td>
            </tr>`;

        // Card format for small screens
        cardHtml += `<div class="card product-card">
            <div class="card-body">
                <h5 class="card-title">${product.productName}</h5>
                <p class="card-text"><strong>Part Number:</strong> ${product.partNumber}</p>
                <p class="card-text"><strong>Manufacturer:</strong> ${product.manufacturer}</p>`;
        for (let i = 0; i < 3; i++) {
            if (product.prices[i]) {
                cardHtml += `<p class="card-text"><strong>Price ${i + 1}:</strong> ${product.prices[i].price} <br> <strong>Supplier:</strong> ${product.prices[i].supplier}</p>`;
            }
        }
        cardHtml += `<button class="btn btn-warning" onclick='openEditModal(${JSON.stringify(product)})'>Edit</button>
                     <button class="btn btn-danger" onclick='deleteProduct("${product._id}")'>Delete</button>
            </div>
        </div>`;
    });

    // Insert the generated HTML into the respective containers
    document.getElementById('productTableBody').innerHTML = tableHtml; // Table for large screens
    document.getElementById('productCardList').innerHTML = cardHtml;  // Cards for small screens
}

//--------------------------------------------------------------------Frontend with Pagination Support----------------------------------

// Function to search products with pagination
function searchProducts(page = 1) {
    const query = document.getElementById('searchQuery').value;
    const url = query ? `https://eposoft-product.onrender.com/products?query=${query}&page=${page}&limit=${rowsPerPage}` : `https://eposoft-product.onrender.com/products?page=${page}&limit=${rowsPerPage}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        totalProducts = data.products;
        paginateProducts(totalProducts, data.totalPages);
    })
    .catch(() => alert('Error fetching products'));
}

// Pagination-related logic
function paginateProducts(products, totalPages) {
    displayProducts(products);
    updatePaginationControls(totalPages);
}

// Function to update the pagination controls
function updatePaginationControls(totalPages) {
    const pageInfo = document.getElementById('pageInfo');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// Pagination control buttons
document.getElementById('prevPage').addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        searchProducts(currentPage);
    }
});

document.getElementById('nextPage').addEventListener('click', function () {
    currentPage++;
    searchProducts(currentPage);
});

// Load initial data on page load
document.addEventListener('DOMContentLoaded', function () {
    searchProducts();
});

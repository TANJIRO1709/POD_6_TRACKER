document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const addItemButton = document.getElementById('add');
    const categoryList = document.getElementById('category-element');
    const addCategoryButton = document.getElementById('category');
    const saveButton = document.getElementById('analysis');
    let activeCategory = null;

    // Initialize with guide text
    initializeGuidingText();

    // Event Listeners
    categoryList.addEventListener('click', handleCategoryClick);
    categoryList.addEventListener('click', handleRemoveClick);
    addItemButton.addEventListener('click', handleAddItem);
    addCategoryButton.addEventListener('click', handleAddCategory);
    saveButton.addEventListener('click', handleSaveData);

    function initializeGuidingText() {
        const guideText = document.createElement('p');
        guideText.textContent = "Click 'Add Category' to proceed";
        guideText.style.textAlign = 'center';
        guideText.style.color = '#666';
        guideText.style.fontSize = '1.2rem';
        guideText.style.padding = '20px';
        guideText.id = 'guide-text';
        categoryList.appendChild(guideText);
    }

    function handleAddItem() {
        if (!activeCategory) {
            const firstCategory = categoryList.querySelector('li');
            if (firstCategory) {
                setActiveCategory(firstCategory);
            } else {
                alert('Please add a category first!');
                return;
            }
        }

        const itemsList = activeCategory.querySelector('.category-list');
        if (!itemsList) return;

        const newItem = createItemElement();
        itemsList.appendChild(newItem);
    }

    function handleAddCategory() {
        // Remove guide text if it exists
        const guideText = document.getElementById('guide-text');
        if (guideText) {
            guideText.remove();
        }

        const newCategory = document.createElement('li');
        newCategory.style.fontSize = '2rem';
        newCategory.innerHTML = createCategoryTemplate();
        categoryList.appendChild(newCategory);
        setActiveCategory(newCategory);
    }

    function setActiveCategory(category) {
        document.querySelectorAll('.active-category').forEach(cat => {
            cat.classList.remove('active-category');
        });
        category.classList.add('active-category');
        activeCategory = category;
    }

    function handleSaveData() {
        try {
            const billData = collectBillData();
            console.log('Collected bill data:', billData);

            if (!billData) {
                console.log('No bill data collected');
                return;
            }

            if (!billData.categories || billData.categories.length === 0) {
                console.log('No categories found in bill data');
                alert('Please add items to at least one category');
                return;
            }

            const saved = saveBillData(billData);
            if (saved) {
                window.location.href = './analysis.html';
            } else {
                alert('Error saving data. Please try again.');
            }
        } catch (error) {
            console.error('Error in handleSaveData:', error);
            alert('An error occurred while saving the data');
        }
    }

    function collectBillData() {
        const date = document.getElementById('date').value;
        const name = document.getElementById('name').value;
        
        if (!validateExpenseForm()) return null;
    
        const billData = {
            date: date,
            name: name,
            categories: []
        };
    
        // Get all categories including the initial one
        const categories = Array.from(document.querySelectorAll('#category-element > li'));
        
        // Process each category
        categories.forEach(category => {
            const categoryData = processCategory(category);
            if (categoryData) {
                billData.categories.push(categoryData);
            }
        });

        // Debug log
        console.log('Collected bill data:', billData);

        if (billData.categories.length === 0) {
            alert('Please add some items to your categories!');
            return null;
        }

        return billData;
    }

    function processCategory(category) {
        console.log('Processing category:', category);

        const categoryText = category.querySelector('.category-text');
        if (!categoryText) {
            console.log('No category text found');
            return null;
        }

        // Get category name or use default if empty
        let categoryName = categoryText.textContent.trim();
        if (!categoryName || categoryName === 'Category:') {
            categoryName = 'Unnamed Category'; // Default name instead of showing alert
        }

        const items = [];
        const itemElements = category.querySelectorAll('.category-list li');
        let hasValidItems = false;

        console.log(`Found ${itemElements.length} items in category "${categoryName}"`);

        itemElements.forEach((itemElement, index) => {
            const nameInput = itemElement.querySelector('.item-input');
            const priceInput = itemElement.querySelector('.price-input');
            const qtyInput = itemElement.querySelector('.qty-input');
            
            if (nameInput && priceInput && qtyInput) {
                const name = nameInput.value.trim();
                const price = parseFloat(priceInput.value);
                const quantity = parseInt(qtyInput.value);
                
                console.log(`Processing item ${index + 1}:`, { name, price, quantity });
                
                // Check for valid input values
                if (name && !isNaN(price) && !isNaN(quantity) && price > 0 && quantity > 0) {
                    hasValidItems = true;
                    items.push({
                        name: name,
                        price: price,
                        quantity: quantity
                    });
                    console.log(`Added item: ${name} with price: ${price} and quantity: ${quantity}`);
                } else {
                    console.log(`Invalid item data at index ${index}`);
                }
            } else {
                console.log(`Missing input elements at index ${index}`);
            }
        });

        // Changed validation logic
        if (items.length === 0) {
            if (itemElements.length > 0) {
                // Only show alert if there are items but none are valid
                const hasIncompleteInputs = Array.from(itemElements).some(item => {
                    const nameInput = item.querySelector('.item-input');
                    const priceInput = item.querySelector('.price-input');
                    const qtyInput = item.querySelector('.qty-input');
                    const hasValue = nameInput?.value.trim() || priceInput?.value || qtyInput?.value;
                    return hasValue; // Return true if any input has a value
                });

                if (hasIncompleteInputs) {
                    alert(`Please complete all item details in category "${categoryName}"`);
                    return null;
                }
            }
        }

        // Add debug logging before return
        console.log('Category processing result:', {
            name: categoryName,
            itemsCount: items.length,
            items: items
        });

        return {
            name: categoryName,
            items: items
        };
    }

    function saveBillData(billData) {
        try {
            // Save current bill data for analysis page
            localStorage.setItem('currentBill', JSON.stringify(billData));
            
            // Get existing expenses
            const previousExpenses = JSON.parse(localStorage.getItem('previousExpenses')) || [];
            
            // Add new expense to array
            previousExpenses.push(billData);
            
            // Save back to localStorage
            localStorage.setItem('previousExpenses', JSON.stringify(previousExpenses));
            
            return true;
        } catch (error) {
            console.error('Error saving bill data:', error);
            return false;
        }
    }

    function createItemElement() {
        const li = document.createElement('li');
        li.innerHTML = `
            <label style="color: black; font-size: 50px;">.</label>
            <input type="text" class="item-input" placeholder="Enter item">
            <label style="color: black;">Rs.</label>
            <input type="number" class="price-input" placeholder="Enter price">
            <label style="color: black;">Qty:</label>
            <input type="number" class="qty-input" placeholder="Enter quantity">
            <button class="remove-btn">×</button>
        `;
        return li;
    }

    function createCategoryTemplate(text = 'Category:') {
        return `<span class="category-text" contenteditable="true">${text}</span>
                <button class="remove-category-btn">×</button>
                <ul class="category-list">
                    <li>
                        <label style="color: black; font-size: 50px;">.</label>
                        <input type="text" class="item-input" placeholder="Enter item">
                        <label style="color: black;">Rs.</label>
                        <input type="number" class="price-input" placeholder="Enter price">
                        <label style="color: black;">Qty:</label>
                        <input type="number" class="qty-input" placeholder="Enter quantity">
                        <button class="remove-btn">×</button>
                    </li>
                </ul>`;
    }

    function handleCategoryClick(e) {
        const categoryItem = e.target.closest('li');
        if (categoryItem && categoryItem.querySelector('.category-list')) {
            setActiveCategory(categoryItem);
        }
    }

    function handleRemoveClick(e) {
        if (e.target.classList.contains('remove-btn')) {
            e.target.closest('li').remove();
        } else if (e.target.classList.contains('remove-category-btn')) {
            e.target.closest('li').remove();
            activeCategory = null;
        }
    }

    function validateExpenseForm() {
        const date = document.getElementById('date').value;
        const name = document.getElementById('name').value;
        if (!date || !name) {
            alert('Please enter both Date and Name before proceeding!');
            return false;
        }
        return true;
    }
});
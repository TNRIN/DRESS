# Elegance Dress Shop

A professional dress selling website built with HTML, CSS, and JavaScript for a school project. The website is designed to be hosted on GitHub Pages.

## Features

- Responsive design using Bootstrap 5
- Product catalog with filtering and sorting options
- Shopping cart functionality with browser cookie storage
- WhatsApp integration for order processing
- Product quick view modal
- Contact form

## Pages

- **Home**: Landing page with featured products and categories
- **Shop**: Product catalog with filtering and sorting options
- **Cart**: Shopping cart with checkout functionality
- **About Us**: Information about the store and contact form

## Technical Details

- Built with HTML5, CSS3, and JavaScript (ES6+)
- Uses Bootstrap 5 for responsive design
- Uses Bootstrap Icons for icons
- Product data stored in JSON files
- No server-side code required (can be hosted on GitHub Pages)

## Data Structure

### system.json

Stores system configuration including:
- Admin WhatsApp number
- Last order number
- Store information
- Shipping costs
- Social media links

### products.json

Stores product information including:
- Product name
- Product images
- Product category
- Available sizes and colors
- Pricing information

## How to Use

1. Clone the repository
2. Open the index.html file in your browser
3. Browse products, add them to cart
4. Checkout by filling the form which will redirect to WhatsApp with order details

## Customization

To customize the store:

1. Edit the `data/system.json` file to update store information and WhatsApp number
2. Edit the `data/products.json` file to update product information
3. Replace product images in the `images/products` directory

## Deployment

This website can be deployed to GitHub Pages by:

1. Creating a GitHub repository
2. Pushing the code to the repository
3. Enabling GitHub Pages in the repository settings

## Credits

- Bootstrap 5: https://getbootstrap.com/
- Bootstrap Icons: https://icons.getbootstrap.com/
- Placeholder images: Replace with your own product images
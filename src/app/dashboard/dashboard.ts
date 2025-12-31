import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ecommerceapp',
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  selectedCategory: string ='';
  searchText: string = '';
  productList: IPorduct[] = [
    {
      productShortName: 'iPhone 15',
      longName: 'Apple iPhone 15 Pro 128GB - Titanium Gray',
      categoryName: 'Electronics',
      desscription:
        'Experience the latest iPhone with A17 Pro chip, dynamic island, and an advanced camera system.',
      sku: 'ELEC-IP15-128',
      price: 124999,
      thumbnailImage:
        'https://images.macrumors.com/article-new/2023/09/iphone-15-pro-gray.jpg',
      isInStock: true,
    },
    {
      productShortName: 'iPhone 14',
      longName: 'Apple iPhone 14 Pro 128GB - Titanium Gray',
      categoryName: 'Electronics',
      desscription:
        'Experience the latest iPhone with A17 Pro chip, dynamic island, and an advanced camera system.',
      sku: 'ELEC-IP15-128',
      price: 124999,
      thumbnailImage:
        'https://techcrunch.com/wp-content/uploads/2022/09/Apple-iphone-14-Pro-review-1.jpeg',
      isInStock: true,
    },
    {
      productShortName: 'iPhone 13',
      longName: 'Apple iPhone 13 Pro 128GB - Titanium Gray',
      categoryName: 'Electronics',
      desscription:
        'Experience the latest iPhone with A17 Pro chip, dynamic island, and an advanced camera system.',
      sku: 'ELEC-IP15-128',
      price: 124999,
      thumbnailImage:
        'https://img.photographyblog.com/reviews/apple_iphone_13_pro/apple_iphone_13_pro_01.jpg',
      isInStock: true,
    },
   
  ];

  addToCartList: IPorduct[]=[];

  filteredProductList : IPorduct[] = [];

  constructor() {
    this.filteredProductList = this.productList;
  }
  //products = signal<IPorduct[]>([])

  onCategoryChanges() {
    this.filteredProductList =  this.productList.filter(m=>m.categoryName == this.selectedCategory);
  }

  onSearch(searchVal: string) {
    
    this.filteredProductList = this.productList.filter(m=>m.productShortName.toLowerCase().startsWith(searchVal.toLowerCase()));
  }


  addToCart(item: IPorduct) {
    
    const isExist =  this.addToCartList.find(m=>m.productShortName == item.productShortName);
    if(isExist != undefined) {
      alert("Product Alredy Added to cart")
    } else {
       this.addToCartList.unshift(item)
       alert('product Added to Cart')
    }
   
  }
}

interface IPorduct {
  productShortName: string;
  longName: string;
  categoryName: string;
  desscription: string;
  sku: string;
  price: number;
  thumbnailImage: string;
  isInStock: boolean;
}
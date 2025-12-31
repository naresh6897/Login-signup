import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ecommerceapp',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  selectedCategory: string = '';
  searchText: string = '';

  productList: IProduct[] = [
    {
      productShortName: 'iPhone 15',
      longName: 'Apple iPhone 15 Pro 128GB - Titanium Gray',
      categoryName: 'Electronics',
      description:
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
      description:
        'Experience the latest iPhone with an advanced camera system and powerful performance.',
      sku: 'ELEC-IP14-128',
      price: 114999,
      thumbnailImage:
        'https://techcrunch.com/wp-content/uploads/2022/09/Apple-iphone-14-Pro-review-1.jpeg',
      isInStock: true,
    },
    {
      productShortName: 'iPhone 13',
      longName: 'Apple iPhone 13 Pro 128GB - Titanium Gray',
      categoryName: 'Electronics',
      description:
        'Experience premium performance and camera quality with iPhone 13 Pro.',
      sku: 'ELEC-IP13-128',
      price: 104999,
      thumbnailImage:
        'https://img.photographyblog.com/reviews/apple_iphone_13_pro/apple_iphone_13_pro_01.jpg',
      isInStock: true,
    }
  ];

  addToCartList: IProduct[] = [];
  filteredProductList: IProduct[] = [];

  constructor(private router: Router) {
    this.filteredProductList = this.productList;
  }

  onCategoryChanges(): void {
    this.filteredProductList = this.productList.filter(
      p => p.categoryName === this.selectedCategory
    );
  }

  onSearch(searchVal: string): void {
    this.filteredProductList = this.productList.filter(
      p => p.productShortName.toLowerCase().startsWith(searchVal.toLowerCase())
    );
  }

  addToCart(item: IProduct): void {
    const isExist = this.addToCartList.find(
      p => p.productShortName === item.productShortName
    );

    if (isExist) {
      alert('Product already added to cart');
    } else {
      this.addToCartList.unshift(item);
      alert('Product added to cart');
    }
  }


  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this.router.navigateByUrl('/');
  }
}

interface IProduct {
  productShortName: string;
  longName: string;
  categoryName: string;
  description: string;
  sku: string;
  price: number;
  thumbnailImage: string;
  isInStock: boolean;
}

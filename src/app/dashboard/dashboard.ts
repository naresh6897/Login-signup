import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ecommerceapp',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  username = '';

  selectedCategory = '';
  searchText = '';

  productList: Product[] = [
    {
      productShortName: 'iPhone 15',
      categoryName: 'Electronics',
      description: 'Latest Apple iPhone with powerful performance.',
      price: 124999,
      image: 'https://images.macrumors.com/article-new/2023/09/iphone-15-pro-gray.jpg',
      isInStock: true
    },
    {
      productShortName: 'iPhone 14',
      categoryName: 'Electronics',
      description: 'Premium build with reliable performance.',
      price: 114999,
      image: 'https://techcrunch.com/wp-content/uploads/2022/09/Apple-iphone-14-Pro-review-1.jpeg',
      isInStock: true
    },
    {
      productShortName: 'iPhone 13',
      categoryName: 'Electronics',
      description: 'Great camera and smooth experience.',
      price: 99999,
      image: 'https://img.photographyblog.com/reviews/apple_iphone_13_pro/apple_iphone_13_pro_01.jpg',
      isInStock: true
    }
  ];

  filteredProductList: Product[] = [];
  cartList: Product[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredProductList = this.productList;

    // load logged-in user
    const user = localStorage.getItem('currentUser');
    this.username = user ? user : 'User';
  }

  filterProducts(): void {
    this.filteredProductList = this.productList.filter(p =>
      (!this.selectedCategory || p.categoryName === this.selectedCategory) &&
      p.productShortName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  addToCart(item: Product): void {
    if (this.isInCart(item)) return;
    this.cartList.push(item);
  }

  isInCart(item: Product): boolean {
    return this.cartList.some(p => p.productShortName === item.productShortName);
  }

  clearCart(): void {
    this.cartList = [];
  }

  logout(): void {
    // remove session only (remember-me stays)
    localStorage.removeItem('isLoggedIn');
    this.router.navigateByUrl('/');
  }
}

interface Product {
  productShortName: string;
  categoryName: string;
  description: string;
  price: number;
  image: string;
  isInStock: boolean;
}

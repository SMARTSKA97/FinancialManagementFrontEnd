import { Component } from '@angular/core';

@Component({
  selector: 'app-blog',
  imports: [],
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class Blog {
  blogPosts = [
    { tag: 'Guide', tagColor: '#10b981', title: '5 Steps to Master Your Monthly Budget', excerpt: 'Learn practical budgeting techniques that actually stick — from tracking to optimizing your spending habits.', date: 'Mar 1, 2026' },
    { tag: 'Update', tagColor: '#38bdf8', title: 'Introducing Dark Mode & Glassmorphism UI', excerpt: 'Our latest UI overhaul brings a stunning frosted-glass design with seamless light/dark mode support.', date: 'Feb 28, 2026' },
    { tag: 'Tips', tagColor: '#818cf8', title: 'How to Categorize Transactions Like a Pro', excerpt: 'Custom categories let you slice your spending data in ways that reveal hidden patterns in your finances.', date: 'Feb 20, 2026' },
    { tag: 'Security', tagColor: '#ef4444', title: 'Why We Use JWT + OTP Authentication', excerpt: 'A deep dive into how Financial Planner keeps your financial data safe with modern authentication practices.', date: 'Feb 15, 2026' },
  ];
}

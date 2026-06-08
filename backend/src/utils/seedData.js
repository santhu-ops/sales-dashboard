const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Account = require('../models/Account');
const Deal = require('../models/Deal');
const Alert = require('../models/Alert');
const Activity = require('../models/Activity');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

const seedData = async () => {
  try {
    // Connect to database
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sales_dashboard';
    await mongoose.connect(dbUri);
    console.log('Seeder: Connected to database. Clearing existing records...');

    // Clean existing data
    await User.deleteMany({});
    await Account.deleteMany({});
    await Deal.deleteMany({});
    await Alert.deleteMany({});
    await Activity.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});

    console.log('Seeder: Collections cleared. Seeding users...');

    // 1. Seed Users
    const users = await User.create([
      {
        name: 'Sarah Connor',
        email: 'admin@salesdashboard.com',
        password: 'Password123',
        role: 'admin',
        isVerified: true,
        department: 'Operations',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        name: 'John Miller',
        email: 'manager@salesdashboard.com',
        password: 'Password123',
        role: 'manager',
        isVerified: true,
        department: 'Sales',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        name: 'Alex Mercer',
        email: 'alex.rep@salesdashboard.com',
        password: 'Password123',
        role: 'employee',
        isVerified: true,
        department: 'Sales',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rep@salesdashboard.com',
        password: 'Password123',
        role: 'employee',
        isVerified: true,
        department: 'Sales',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        name: 'David Kim',
        email: 'david.rep@salesdashboard.com',
        password: 'Password123',
        role: 'employee',
        isVerified: true,
        department: 'Sales',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    ]);

    const admin = users[0];
    const manager = users[1];
    const repAlex = users[2];
    const repElena = users[3];
    const repDavid = users[4];

    console.log('Seeder: Users created. Seeding Products...');

    // 2. Seed Products
    const products = await Product.create([
      { name: 'Cloud Compute Infrastructure', description: 'On-demand high performance cloud computing nodes', price: 1200, category: 'Subscription', sku: 'SUB-CLOUD-01', stock: 100, status: 'active', unitsSold: 42, revenue: 50400 },
      { name: 'Enterprise Cybersecurity Suite', description: 'Advanced firewall, DDoS protection, and incident response package', price: 5000, category: 'Software', sku: 'SW-SECURE-02', stock: 50, status: 'active', unitsSold: 12, revenue: 60000 },
      { name: 'AI Business Automation Engine', description: 'Next-gen cognitive workflow automation using neural logic APIs', price: 8500, category: 'Software', sku: 'SW-AI-AUTO-03', stock: 35, status: 'active', unitsSold: 8, revenue: 68000 },
      { name: 'API Gateway Portal (Annual)', description: 'Developer portal licensing with analytics & rate-limiting metrics', price: 2500, category: 'Subscription', sku: 'SUB-API-PORT', stock: 200, status: 'active', unitsSold: 20, revenue: 50000 },
      { name: 'Legacy Mainframe Support', description: '24/7 dedicated engineering support for legacy installations', price: 15000, category: 'Service', sku: 'SRV-MAIN-SUP', stock: 10, status: 'active', unitsSold: 3, revenue: 45000 },
      { name: 'Hardware Security Module (HSM v2)', description: 'Physical appliance for cryptographic operations', price: 9500, category: 'Hardware', sku: 'HW-HSM-V2', stock: 15, status: 'active', unitsSold: 5, revenue: 47500 },
      { name: 'Enterprise CRM Platform (Annual User)', description: 'Annual seat license for the premium CRM cloud interface', price: 950, category: 'Subscription', sku: 'SUB-CRM-USER', stock: 500, status: 'active', unitsSold: 120, revenue: 114000 }
    ]);

    console.log('Seeder: Products created. Seeding Customers...');

    // 3. Seed Customers
    const customers = await Customer.create([
      { firstName: 'James', lastName: 'Howlett', email: 'j.howlett@cyberdyne.com', phone: '+1-555-0199', company: 'Cyberdyne Systems', status: 'active', totalSpend: 130000, tags: ['Enterprise', 'Technology'], city: 'Sunnyvale', country: 'United States', assignedTo: repAlex._id },
      { firstName: 'Bruce', lastName: 'Wayne', email: 'bwayne@wayneenterprises.com', phone: '+1-555-7777', company: 'Wayne Enterprises', status: 'active', totalSpend: 245000, tags: ['VIP', 'Automotive'], city: 'Gotham', country: 'United States', assignedTo: repElena._id },
      { firstName: 'Diana', lastName: 'Prince', email: 'diana@themiscira-museum.org', phone: '+30-210-9988', company: 'Themyscira Cultural', status: 'active', totalSpend: 45000, tags: ['Government', 'Non-Profit'], city: 'Athens', country: 'Greece', assignedTo: repDavid._id },
      { firstName: 'Tony', lastName: 'Stark', email: 'tony@starkindustries.com', phone: '+1-555-3000', company: 'Stark Industries', status: 'active', totalSpend: 620000, tags: ['Key Account', 'Defense'], city: 'Malibu', country: 'United States', assignedTo: repAlex._id },
      { firstName: 'Peter', lastName: 'Parker', email: 'peter@dailybugle.com', phone: '+1-555-8472', company: 'Daily Bugle Media', status: 'lead', totalSpend: 0, tags: ['SMB', 'Media'], city: 'New York', country: 'United States', assignedTo: repElena._id },
      { firstName: 'Arthur', lastName: 'Dent', email: 'arthur@hitchhiker-guide.net', phone: '+44-20-7946', company: 'Heart of Gold Co.', status: 'inactive', totalSpend: 8500, tags: ['International'], city: 'London', country: 'United Kingdom', assignedTo: repDavid._id },
      { firstName: 'Selina', lastName: 'Kyle', email: 'selina.kyle@catburglar.org', phone: '+1-555-9081', company: 'Gotham Jewelers', status: 'active', totalSpend: 35000, tags: ['Retail'], city: 'Gotham', country: 'United States', assignedTo: repElena._id },
      { firstName: 'Clark', lastName: 'Kent', email: 'ckent@dailyplanet.com', phone: '+1-555-1234', company: 'Daily Planet', status: 'active', totalSpend: 15000, tags: ['Media'], city: 'Metropolis', country: 'United States', assignedTo: repDavid._id }
    ]);

    console.log('Seeder: Customers created. Seeding Sales...');

    // Date calculations for sales
    const now = new Date();
    const curMonthDate = (day) => new Date(now.getFullYear(), now.getMonth(), day);
    const prevMonthDate = (day) => new Date(now.getFullYear(), now.getMonth() - 1, day);

    // 4. Seed Sales (linked to Customers & Products)
    await Sale.create([
      // Current Month Sales
      { saleNumber: 'SL-00001', customer: customers[0]._id, product: products[4]._id, quantity: 2, unitPrice: 15000, discount: 5, amount: 28500, status: 'completed', saleDate: curMonthDate(5), salesperson: repAlex._id, notes: 'Mainframe support for Cyberdyne server rooms.' },
      { saleNumber: 'SL-00002', customer: customers[1]._id, product: products[1]._id, quantity: 4, unitPrice: 5000, discount: 0, amount: 20000, status: 'completed', saleDate: curMonthDate(8), salesperson: repElena._id, notes: 'Securing Wayne Enterprises perimeter systems.' },
      { saleNumber: 'SL-00003', customer: customers[2]._id, product: products[3]._id, quantity: 6, unitPrice: 2500, discount: 10, amount: 13500, status: 'completed', saleDate: curMonthDate(12), salesperson: repDavid._id, notes: 'Themyscira Cultural digital library portal.' },
      { saleNumber: 'SL-00004', customer: customers[3]._id, product: products[2]._id, quantity: 5, unitPrice: 8500, discount: 0, amount: 42500, status: 'completed', saleDate: curMonthDate(18), salesperson: repAlex._id, notes: 'AI-driven logistics automation engine.' },
      { saleNumber: 'SL-00005', customer: customers[0]._id, product: products[0]._id, quantity: 20, unitPrice: 1200, discount: 15, amount: 20400, status: 'completed', saleDate: curMonthDate(20), salesperson: repAlex._id, notes: 'Bulk cloud node provisioning.' },
      
      // Last Month Sales (for growth comparison)
      { saleNumber: 'SL-00006', customer: customers[3]._id, product: products[4]._id, quantity: 3, unitPrice: 15000, discount: 0, amount: 45000, status: 'completed', saleDate: prevMonthDate(3), salesperson: repAlex._id },
      { saleNumber: 'SL-00007', customer: customers[1]._id, product: products[2]._id, quantity: 2, unitPrice: 8500, discount: 5, amount: 16150, status: 'completed', saleDate: prevMonthDate(10), salesperson: repElena._id },
      { saleNumber: 'SL-00008', customer: customers[6]._id, product: products[5]._id, quantity: 1, unitPrice: 9500, discount: 0, amount: 9500, status: 'completed', saleDate: prevMonthDate(15), salesperson: repElena._id },
      { saleNumber: 'SL-00009', customer: customers[7]._id, product: products[3]._id, quantity: 3, unitPrice: 2500, discount: 0, amount: 7500, status: 'completed', saleDate: prevMonthDate(22), salesperson: repDavid._id },

      // Pending and Cancelled
      { saleNumber: 'SL-00010', customer: customers[4]._id, product: products[6]._id, quantity: 10, unitPrice: 950, discount: 0, amount: 9500, status: 'pending', saleDate: curMonthDate(22), salesperson: repElena._id },
      { saleNumber: 'SL-00011', customer: customers[5]._id, product: products[0]._id, quantity: 2, unitPrice: 1200, discount: 0, amount: 2400, status: 'cancelled', saleDate: curMonthDate(14), salesperson: repDavid._id }
    ]);

    console.log('Seeder: Sales created. Seeding Customer Accounts...');

    // 5. Seed Accounts (original Model)
    const accounts = await Account.create([
      { companyName: 'Acme Corp', industry: 'Manufacturing', region: 'North America', healthScore: 92, churnRiskFlag: false },
      { companyName: 'TechCorp Solutions', industry: 'Technology', region: 'North America', healthScore: 85, churnRiskFlag: false },
      { companyName: 'Global Finance Group', industry: 'Finance', region: 'Europe', healthScore: 45, churnRiskFlag: true },
      { companyName: 'MediHealth Systems', industry: 'Healthcare', region: 'Europe', healthScore: 88, churnRiskFlag: false },
      { companyName: 'Asia Retail Ventures', industry: 'Retail', region: 'Asia Pacific', healthScore: 68, churnRiskFlag: false },
      { companyName: 'EcoPower Energy', industry: 'Energy', region: 'Latin America', healthScore: 78, churnRiskFlag: false },
      { companyName: 'Cyberdyne Systems', industry: 'Technology', region: 'Asia Pacific', healthScore: 30, churnRiskFlag: true },
      { companyName: 'Vanguard Invest', industry: 'Finance', region: 'North America', healthScore: 95, churnRiskFlag: false }
    ]);

    console.log('Seeder: Accounts created. Seeding deals...');

    // 6. Seed Deals
    const dealsData = [
      { title: 'TechCorp Solutions - Cloud Migration', value: 85000, stage: 'Closed Won', owner: repAlex._id, probability: 100, createdAt: curMonthDate(5) },
      { title: 'Acme Corp - ERP License Upgrade', value: 45000, stage: 'Closed Won', owner: repElena._id, probability: 100, createdAt: curMonthDate(8) },
      { title: 'Vanguard Invest - Security Suite', value: 35000, stage: 'Closed Won', owner: repDavid._id, probability: 100, createdAt: curMonthDate(12) },
      { title: 'MediHealth Systems - Telehealth Deployment', value: 120000, stage: 'Closed Won', owner: repAlex._id, probability: 100, createdAt: curMonthDate(18) },
      { title: 'TechCorp Solutions - Dedicated Servers', value: 60000, stage: 'Closed Won', owner: repAlex._id, probability: 100, createdAt: prevMonthDate(5) },
      { title: 'Acme Corp - Support Renewal', value: 25000, stage: 'Closed Won', owner: repElena._id, probability: 100, createdAt: prevMonthDate(10) },
      { title: 'Global Finance Group - Auditing API', value: 40000, stage: 'Closed Won', owner: repDavid._id, probability: 100, createdAt: prevMonthDate(15) },
      { title: 'Global Finance Group - Cybersecurity Consultation', value: 55000, stage: 'Negotiation', owner: repDavid._id, probability: 80, createdAt: curMonthDate(14) },
      { title: 'Cyberdyne Systems - Robotic Automation API', value: 95000, stage: 'Proposal', owner: repElena._id, probability: 60, createdAt: curMonthDate(15) },
      { title: 'Asia Retail Ventures - POS System Rollout', value: 30000, stage: 'Qualified', owner: repAlex._id, probability: 40, createdAt: curMonthDate(2) },
      { title: 'EcoPower Energy - Grid Management Software', value: 75000, stage: 'Proposal', owner: repElena._id, probability: 50, createdAt: curMonthDate(22) },
      { title: 'Vanguard Invest - Trading Engine Upgrade', value: 110000, stage: 'Negotiation', owner: repDavid._id, probability: 90, createdAt: curMonthDate(24) },
      { title: 'Acme Corp - Supply Chain Analytics', value: 15000, stage: 'Lead', owner: repElena._id, probability: 10, createdAt: curMonthDate(25) },
      { title: 'EcoPower Energy - Solar Optimization Audit', value: 50000, stage: 'Closed Lost', owner: repDavid._id, probability: 0, createdAt: prevMonthDate(20) },
      { title: 'Cyberdyne Systems - CPU Mainframe License', value: 130000, stage: 'Closed Lost', owner: repAlex._id, probability: 0, createdAt: curMonthDate(10) }
    ];

    const deals = await Deal.create(dealsData);

    console.log('Seeder: Deals created. Seeding Alerts and Activities...');

    // 7. Seed Alerts
    await Alert.create([
      {
        message: 'High Value Deal Created: "Vanguard Invest - Trading Engine Upgrade" valued at $110,000 by David Kim',
        type: 'danger',
        isRead: false,
        createdAt: curMonthDate(24)
      },
      {
        message: 'High Value Deal Created: "MediHealth Systems - Telehealth Deployment" valued at $120,000 by Alex Mercer',
        type: 'danger',
        isRead: true,
        createdAt: curMonthDate(18)
      },
      {
        message: 'System Alert: Monthly reports are ready for export.',
        type: 'info',
        isRead: true,
        createdAt: curMonthDate(1)
      }
    ]);

    // 8. Seed Activities
    await Activity.create([
      {
        userId: repAlex._id,
        dealId: deals[0]._id,
        type: 'deal_created',
        description: 'Alex Mercer created the deal "TechCorp Solutions - Cloud Migration".'
      },
      {
        userId: repAlex._id,
        dealId: deals[0]._id,
        type: 'meeting',
        description: 'Meeting conducted with TechCorp CTO regarding Cloud Architecture plan.'
      },
      {
        userId: repElena._id,
        dealId: deals[1]._id,
        type: 'stage_change',
        description: 'Elena Rostova updated "Acme Corp - ERP License Upgrade" status to Closed Won.'
      },
      {
        userId: repDavid._id,
        dealId: deals[7]._id,
        type: 'call',
        description: 'Follow-up call to review service agreement. Proposal reviewed.'
      },
      {
        userId: repElena._id,
        dealId: deals[8]._id,
        type: 'email',
        description: 'Sent initial pricing proposal to Cyberdyne project board.'
      }
    ]);

    console.log('Seeder: Database successfully populated!');
    await mongoose.disconnect();
    console.log('Seeder: Disconnected from database.');
  } catch (error) {
    console.error('Seeder failed with error:', error);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
};

seedData();

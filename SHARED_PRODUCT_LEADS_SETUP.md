# Shared Product Leads Feature Setup

This feature allows users to share products from the FinsangMart app, and when recipients click the shared link, they fill out a form with their details before being redirected to the actual application process.

## Database Setup

1. Run the SQL script to create the required table:

```sql
-- Execute the contents of shared_product_leads.sql in your Supabase database
```

This creates a `shared_product_leads` table with the following structure:
- Product details (ID, name, image, benefits, application URL)
- Sender details (who shared the product)
- User details (who filled the form)
- Status tracking and notes

## Features Implemented

### 1. Shared Product Form (`/shared-product-form`)
- Collects user details: name, mobile, email, income, pincode, age
- Shows product information and sender details
- Validates form inputs
- Stores data in Supabase
- Redirects to actual application process after submission

### 2. API Endpoints

#### GET `/api/shared-products/get-product`
- Fetches product and sender details
- Parameters: `productId`, `senderId`

#### POST `/api/shared-products/submit-details`
- Stores user details in the database
- Body: `{ productId, senderId, userDetails }`

#### GET `/api/shared-products/leads`
- Fetches leads for admin dashboard
- Parameters: `page`, `limit`, `status`, `search`

#### PATCH `/api/shared-products/leads`
- Updates lead status and notes
- Body: `{ leadId, status, notes }`

### 3. Admin Dashboard (`/admin/leads`)
- View all shared product leads
- Filter by status and search
- Edit lead status and add notes
- Pagination support

## React Native App Changes

The `shareUtils.js` file has been updated to:
- Generate a form URL instead of direct application URL
- Include product ID and sender ID as URL parameters
- Format: `https://your-domain.com/shared-product-form?productId={id}&senderId={senderId}`

## Setup Instructions

1. **Database Setup**:
   ```bash
   # Run the SQL script in your Supabase SQL editor
   # Copy contents from shared_product_leads.sql
   ```

2. **Install Dependencies**:
   ```bash
   cd finsang-next-admin
   npm install
   ```

3. **Environment Variables**:
   Ensure your `.env.local` has the correct Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Update Domain**:
   In `FinsangMart/lib/shareUtils.js`, replace `https://your-domain.com` with your actual domain.

5. **Start the Application**:
   ```bash
   npm run dev
   ```

## Usage Flow

1. **User shares product** from FinsangMart app
2. **Recipient clicks link** and sees the form
3. **Form collects details** and stores in database
4. **User is redirected** to actual application process
5. **Admin can view leads** in `/admin/leads` dashboard

## Form Validation

- Name: Required
- Mobile: Required, 10-digit Indian number
- Email: Required, valid email format
- Age: Required, 18-100 years
- Pincode: Required, 6-digit Indian pincode
- Income: Optional

## Lead Status Tracking

- `pending`: New lead, not yet contacted
- `contacted`: Lead has been contacted
- `applied`: User has applied for the product
- `rejected`: Lead was rejected

## Security Considerations

- Form is publicly accessible (no authentication required)
- Input validation on both client and server
- Rate limiting should be implemented for production
- Consider adding CAPTCHA for spam prevention

## Customization

- Modify form fields in `/shared-product-form/page.tsx`
- Update validation rules as needed
- Customize the form styling using Material-UI components
- Add additional tracking fields to the database schema 
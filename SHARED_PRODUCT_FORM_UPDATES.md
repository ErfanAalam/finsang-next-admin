# Shared Product Form Updates

## Overview
The shared product form has been enhanced with additional fields and an auto-incrementing `finsangId` system to provide better lead tracking and user identification.

## New Features

### 1. Additional Form Fields
- **Date of Birth**: Required field with age validation (18-100 years)
- **PAN Card Number**: Required field with format validation (ABCDE1234F)
- **Employment Status**: Dropdown with options (Employed/Unemployed)
- **Company Name**: Conditional field (required only if employed)

### 2. Auto-Incrementing Finsang ID
- Each form submission generates a unique `finsangId` starting from 1001
- The ID increments automatically for every submission, regardless of user
- Displayed to users upon successful submission

## Database Changes

### New Columns Added
```sql
finsang_id INTEGER DEFAULT nextval('finsang_id_sequence') UNIQUE NOT NULL,
date_of_birth DATE,
pancard TEXT,
employment_status TEXT CHECK (employment_status IN ('employed', 'unemployed')),
company_name TEXT
```

### Sequence Creation
```sql
CREATE SEQUENCE IF NOT EXISTS finsang_id_sequence START 1001;
```

### Indexes
- Added index on `finsang_id` for better query performance

## Form Validation

### Required Fields
- Full Name
- Mobile Number (10 digits, starts with 6-9)
- Email Address (valid format)
- Age (18-100 years)
- Pincode (6 digits, not starting with 0)
- Date of Birth (must correspond to valid age)
- PAN Card Number (format: ABCDE1234F)
- Employment Status

### Conditional Validation
- Company Name is required only when Employment Status is "Employed"

### Format Validations
- **Mobile**: `/^[6-9]\d{9}$/`
- **Pincode**: `/^[1-9][0-9]{5}$/`
- **PAN Card**: `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`
- **Email**: Standard email format validation

## API Changes

### Updated Endpoint
`POST /api/shared-products/submit-details`

### New Request Body Fields
```json
{
  "userDetails": {
    "name": "string",
    "mobile": "string",
    "email": "string",
    "income": "string (optional)",
    "pincode": "string",
    "age": "string",
    "dateOfBirth": "string (YYYY-MM-DD)",
    "pancard": "string",
    "employmentStatus": "employed" | "unemployed",
    "companyName": "string (required if employed)"
  }
}
```

### Response
```json
{
  "success": true,
  "message": "Lead data saved successfully",
  "leadId": "uuid",
  "finsangId": 1001
}
```

## Setup Instructions

### For New Installation
1. Run the `shared_product_leads.sql` file to create the table with all new fields

### For Existing Installation
1. Run the `update_shared_product_leads.sql` file to add new columns to existing table
2. This will automatically assign `finsangId` to existing records starting from 1001

### If Sequence is Already Incorrect
If the sequence is generating incorrect numbers (e.g., 1005 for 4th user), run the `fix_finsang_id_sequence.sql` script to correct it.

## UI/UX Improvements

### Form Organization
- **Personal Information Section**: Basic details, PAN card, date of birth
- **Employment Information Section**: Employment status and conditional company name

### User Experience
- Conditional field rendering based on employment status
- Real-time validation with helpful error messages
- Success message displays the generated `finsangId`
- Automatic redirection to application process after submission

### Visual Enhancements
- Section headers for better organization
- Form validation with Material-UI components
- Responsive design for mobile and desktop

## Testing

### Test Cases
1. **Valid Submission**: All required fields filled correctly
2. **Employment Status**: Test both "Employed" and "Unemployed" scenarios
3. **Validation**: Test all field validations (mobile, email, PAN, etc.)
4. **Finsang ID**: Verify auto-incrementing behavior
5. **Error Handling**: Test with missing/invalid fields

### Sample Test Data
```json
{
  "name": "John Doe",
  "mobile": "9876543210",
  "email": "john.doe@example.com",
  "income": "50000",
  "pincode": "123456",
  "age": "30",
  "dateOfBirth": "1993-05-15",
  "pancard": "ABCDE1234F",
  "employmentStatus": "employed",
  "companyName": "Tech Solutions Ltd"
}
```

## Security Considerations

### Data Validation
- Server-side validation for all fields
- SQL injection prevention through parameterized queries
- XSS prevention through proper input sanitization

### Privacy
- PAN card numbers are stored securely
- Date of birth is validated for age appropriateness
- All personal data is handled according to privacy policies

## Future Enhancements

### Potential Additions
- Document upload functionality
- Address verification
- Income verification
- Credit score integration
- Lead status tracking dashboard

### Analytics
- Track form completion rates
- Monitor validation error patterns
- Analyze lead quality based on new fields

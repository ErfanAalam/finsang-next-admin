'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardContent, Typography, Box, TextField, Button, List, ListItem, ListItemText, IconButton, CircularProgress, Alert, Tooltip, Checkbox, FormControlLabel, Switch } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { MenuItem } from '@mui/material';
import apiClient from '../lib/api-client';
import { useAuth } from '../lib/auth-context';

// Define types for our data structures
const payoutSections = ['basic', 'bonus', 'coins'] as const;
type PayoutSection = typeof payoutSections[number];
const payoutLevels = ['beginner', 'pro', 'expert', 'genius'] as const;
type PayoutLevel = typeof payoutLevels[number];
const eligibilityTypes = ['salaried', 'self_employed'] as const;
type EligibilityType = typeof eligibilityTypes[number];

interface CardBenefit {
  title: string;
  description: string;
}

interface Faq {
  question: string;
  answer: string;
}

interface Payout {
  basic: Record<PayoutLevel, number>;
  bonus: Record<PayoutLevel, number>;
  coins: Record<PayoutLevel, number>;
}

interface PayoutState {
  basic: Record<PayoutLevel, string>;
  bonus: Record<PayoutLevel, string>;
  coins: Record<PayoutLevel, string>;
}

interface Eligibility {
  salaried: { age: string; income: string };
  self_employed: { age: string; income: string };
}

interface Product {
  id: string;
  type: string;
  youtube_url?: string;
  card_name?: string;
  bank_name?: string;
  benefits?: string[];
  payout?: Payout;
  terms?: string[];
  card_benefits?: CardBenefit[];
  application_process_url?: string;
  eligibility?: Eligibility;
  faqs?: Faq[];
  joining_fees?: string;
  renewal_fees?: string;
  payout_str?: string;
  Image_url?: string;
  popular_product?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProductType {
  id: string;
  type: string;
}

const ProductsTab: React.FC = () => {
  const [tab, setTab] = useState(0); // 0: Add Product, 1: Manage Categories, 2: Manage Products
  const { isModerator, isAdmin } = useAuth();

  // Product category state
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [newProductType, setNewProductType] = useState('');

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    youtube_url: '',
    card_name: '',
    bank_name: '',
    benefits: [''],
    joining_fees: '',
    renewal_fees: '',
    payout_str: '',
    application_process_url: '',
    terms: [''],
    popular_product: false,
  });

  // Payout state
  const [payoutData, setPayoutData] = useState<PayoutState>({
    basic: { beginner: '', pro: '', expert: '', genius: '' },
    bonus: { beginner: '', pro: '', expert: '', genius: '' },
    coins: { beginner: '', pro: '', expert: '', genius: '' },
  });

  // Card benefits state
  const [cardBenefits, setCardBenefits] = useState<CardBenefit[]>([{ title: '', description: '' }]);

  // Eligibility state
  const [eligibilityData, setEligibilityData] = useState<Eligibility>({
    salaried: { age: '', income: '' },
    self_employed: { age: '', income: '' },
  });

  // FAQs state
  const [faqsData, setFaqsData] = useState<Faq[]>([{ question: '', answer: '' }]);

  // Edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch product types on mount
  useEffect(() => {
    fetchProductTypes();
  }, []);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProductTypes = async () => {
    try {
      const response = await apiClient.getProductTypes();
      setProductTypes(response.types || []);
    } catch (error) {
      setCategoryError(error instanceof Error ? error.message : 'Failed to fetch product types');
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      // Request a higher limit to get more products (or all products)
      const response = await apiClient.getProducts(1,100); // Increased limit to 100
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProductsError(error instanceof Error ? error.message : 'Failed to fetch products');
    } finally {
      setProductsLoading(false);
    }
  };

  // Add new product type
  const handleAddProductType = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryLoading(true);
    setCategoryError('');
    setCategorySuccess('');
    
    if (!newProductType.trim()) {
      setCategoryError('Type name cannot be empty');
      setCategoryLoading(false);
      return;
    }

    try {
      await apiClient.createProductType(newProductType.trim());
      setCategorySuccess('Category added successfully!');
      setNewProductType('');
      fetchProductTypes();
    } catch (error) {
      setCategoryError(error instanceof Error ? error.message : 'Failed to add category');
    } finally {
      setCategoryLoading(false);
    }
  };

  // Delete product type
  const handleDeleteProductType = async (typeToDelete: string) => {
    if (!isAdmin) {
      setCategoryError('Only admins can delete categories');
      return;
    }

    try {
      await apiClient.deleteProductType(typeToDelete);
      setCategorySuccess('Category deleted successfully!');
      fetchProductTypes();
    } catch (error) {
      setCategoryError(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!isAdmin) {
      setProductsError('Only admins can delete products');
      return;
    }

    try {
      await apiClient.deleteProduct(productId);
      setSuccess('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    
    // Set form data
    setFormData({
      type: product.type || '',
      youtube_url: product.youtube_url || '',
      card_name: product.card_name || '',
      bank_name: product.bank_name || '',
      benefits: product.benefits || [''],
      joining_fees: product.joining_fees || '',
      renewal_fees: product.renewal_fees || '',
      payout_str: product.payout_str || '',
      application_process_url: product.application_process_url || '',
      terms: product.terms || [''],
      popular_product: product.popular_product || false,
    });

    // Set payout data
    if (product.payout) {
      setPayoutData({
        basic: {
          beginner: product.payout.basic?.beginner?.toString() || '',
          pro: product.payout.basic?.pro?.toString() || '',
          expert: product.payout.basic?.expert?.toString() || '',
          genius: product.payout.basic?.genius?.toString() || '',
        },
        bonus: {
          beginner: product.payout.bonus?.beginner?.toString() || '',
          pro: product.payout.bonus?.pro?.toString() || '',
          expert: product.payout.bonus?.expert?.toString() || '',
          genius: product.payout.bonus?.genius?.toString() || '',
        },
        coins: {
          beginner: product.payout.coins?.beginner?.toString() || '',
          pro: product.payout.coins?.pro?.toString() || '',
          expert: product.payout.coins?.expert?.toString() || '',
          genius: product.payout.coins?.genius?.toString() || '',
        },
      });
    }

    // Set card benefits
    setCardBenefits(product.card_benefits || [{ title: '', description: '' }]);

    // Set eligibility data
    setEligibilityData(product.eligibility || {
      salaried: { age: '', income: '' },
      self_employed: { age: '', income: '' },
    });

    // Set FAQs data
    setFaqsData(product.faqs || [{ question: '', answer: '' }]);

    setSelectedFile(null);
    setTab(0); // Switch to Add Product tab for editing
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Upload image
  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) {
      throw new Error('No file selected');
    }

    setUploadingImage(true);
    try {
      const result = await apiClient.uploadProductImage(selectedFile);
      return result.url;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field: 'benefits' | 'terms', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayFieldItem = (field: 'benefits' | 'terms') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayFieldItem = (field: 'benefits' | 'terms', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Handle payout changes
  const handlePayoutChange = (section: PayoutSection, level: PayoutLevel, value: string) => {
    setPayoutData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [level]: value
      }
    }));
  };

  // Handle card benefits changes
  const handleCardBenefitChange = (index: number, field: 'title' | 'description', value: string) => {
    setCardBenefits(prev => prev.map((benefit, i) => 
      i === index ? { ...benefit, [field]: value } : benefit
    ));
  };

  const addCardBenefit = () => {
    setCardBenefits(prev => [...prev, { title: '', description: '' }]);
  };

  const removeCardBenefit = (index: number) => {
    setCardBenefits(prev => prev.filter((_, i) => i !== index));
  };

  // Handle eligibility changes
  const handleEligibilityChange = (type: EligibilityType, field: 'age' | 'income', value: string) => {
    setEligibilityData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  // Handle FAQs changes
  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqsData(prev => prev.map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    ));
  };

  const addFaq = () => {
    setFaqsData(prev => [...prev, { question: '', answer: '' }]);
  };

  const removeFaq = (index: number) => {
    setFaqsData(prev => prev.filter((_, i) => i !== index));
  };

  // Submit product form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.type || !formData.card_name) {
      setError('Type and card name are required');
      setLoading(false);
      return;
    }

    try {
      let imageUrl = editingProduct?.Image_url || '';

      // Upload image if file is selected
      if (selectedFile) {
        imageUrl = await uploadImage();
      }

      // Convert payout data to numbers
      const payout: Payout = {
        basic: {
          beginner: parseFloat(payoutData.basic.beginner) || 0,
          pro: parseFloat(payoutData.basic.pro) || 0,
          expert: parseFloat(payoutData.basic.expert) || 0,
          genius: parseFloat(payoutData.basic.genius) || 0,
        },
        bonus: {
          beginner: parseFloat(payoutData.bonus.beginner) || 0,
          pro: parseFloat(payoutData.bonus.pro) || 0,
          expert: parseFloat(payoutData.bonus.expert) || 0,
          genius: parseFloat(payoutData.bonus.genius) || 0,
        },
        coins: {
          beginner: parseFloat(payoutData.coins.beginner) || 0,
          pro: parseFloat(payoutData.coins.pro) || 0,
          expert: parseFloat(payoutData.coins.expert) || 0,
          genius: parseFloat(payoutData.coins.genius) || 0,
        },
      };

      // Clean up the data before sending
      const cleanFormData = {
        ...formData,
        youtube_url: formData.youtube_url?.trim() || null,
        bank_name: formData.bank_name?.trim() || null,
        joining_fees: formData.joining_fees?.trim() || null,
        renewal_fees: formData.renewal_fees?.trim() || null,
        payout_str: formData.payout_str?.trim() || null,
        application_process_url: formData.application_process_url?.trim() || null,
      };

      const productData = {
        ...cleanFormData,
        Image_url: imageUrl || null,
        benefits: formData.benefits.filter(b => b.trim()),
        terms: formData.terms.filter(t => t.trim()),
        payout,
        card_benefits: cardBenefits.filter(cb => cb.title.trim() && cb.description.trim()),
        eligibility: eligibilityData,
        faqs: faqsData.filter(faq => faq.question.trim() && faq.answer.trim()),
      };

      if (editingProduct) {
        // Update existing product
        // console.log('Updating product with data:', JSON.stringify(productData, null, 2));
        await apiClient.updateProduct(editingProduct.id, productData);
        setSuccess('Product updated successfully!');
        setEditingProduct(null);
      } else {
        // Create new product
        // console.log('Creating product with data:', JSON.stringify(productData, null, 2));
        await apiClient.createProduct(productData);
        setSuccess('Product created successfully!');
      }

      // Reset form
      resetForm();
      fetchProducts();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: '',
      youtube_url: '',
      card_name: '',
      bank_name: '',
      benefits: [''],
      joining_fees: '',
      renewal_fees: '',
      payout_str: '',
      application_process_url: '',
      terms: [''],
      popular_product: false,
    });
    setPayoutData({
      basic: { beginner: '', pro: '', expert: '', genius: '' },
      bonus: { beginner: '', pro: '', expert: '', genius: '' },
      coins: { beginner: '', pro: '', expert: '', genius: '' },
    });
    setCardBenefits([{ title: '', description: '' }]);
    setEligibilityData({
      salaried: { age: '', income: '' },
      self_employed: { age: '', income: '' },
    });
    setFaqsData([{ question: '', answer: '' }]);
    setSelectedFile(null);
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Add Product" />
        <Tab label="Manage Categories" />
        <Tab label="Manage Products" />
      </Tabs>

      {/* Add Product Tab */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Basic Information */}
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>Basic Information</Typography>
              
              <TextField
                fullWidth
                select
                label="Product Type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                margin="normal"
                required
              >
                {productTypes.map((type) => (
                                  <MenuItem key={type.id} value={type.type}>
                  {type.type}
                </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Card Name"
                value={formData.card_name}
                onChange={(e) => handleInputChange('card_name', e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Bank Name"
                value={formData.bank_name}
                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="YouTube URL"
                value={formData.youtube_url}
                onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Application Process URL"
                value={formData.application_process_url}
                onChange={(e) => handleInputChange('application_process_url', e.target.value)}
                margin="normal"
              />

              {/* Fees */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Fees</Typography>
              
              <TextField
                fullWidth
                label="Joining Fees"
                value={formData.joining_fees}
                onChange={(e) => handleInputChange('joining_fees', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Renewal Fees"
                value={formData.renewal_fees}
                onChange={(e) => handleInputChange('renewal_fees', e.target.value)}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Payout String"
                value={formData.payout_str}
                onChange={(e) => handleInputChange('payout_str', e.target.value)}
                margin="normal"
              />

              {/* Image Upload */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Product Image</Typography>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="product-image-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="product-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    disabled={uploadingImage}
                    sx={{ mr: 2 }}
                  >
                    {uploadingImage ? <CircularProgress size={20} /> : 'Upload Image'}
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {selectedFile.name}
                  </Typography>
                )}
                {editingProduct?.Image_url && !selectedFile && (
                  <Typography variant="body2" color="text.secondary">
                    Current image: {editingProduct.Image_url}
                  </Typography>
                )}
              </Box>

              {/* Popular Product Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.popular_product}
                    onChange={(e) => handleInputChange('popular_product', e.target.checked)}
                  />
                }
                label="Popular Product"
                sx={{ mb: 2 }}
              />

              {/* Benefits */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Benefits</Typography>
              {formData.benefits.map((benefit, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Benefit ${index + 1}`}
                    value={benefit}
                    onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
                  />
                  <IconButton onClick={() => removeArrayFieldItem('benefits', index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={() => addArrayFieldItem('benefits')} sx={{ mb: 2 }}>
                Add Benefit
              </Button>

              {/* Terms */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Terms</Typography>
              {formData.terms.map((term, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Term ${index + 1}`}
                    value={term}
                    onChange={(e) => handleArrayFieldChange('terms', index, e.target.value)}
                  />
                  <IconButton onClick={() => removeArrayFieldItem('terms', index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={() => addArrayFieldItem('terms')} sx={{ mb: 2 }}>
                Add Term
              </Button>

              {/* Payout Structure */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Payout Structure</Typography>
              {payoutSections.map((section) => (
                <Box key={section} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, textTransform: 'capitalize' }}>
                    {section}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    {payoutLevels.map((level) => (
                      <TextField
                        key={level}
                        label={level.charAt(0).toUpperCase() + level.slice(1)}
                        value={payoutData[section][level]}
                        onChange={(e) => handlePayoutChange(section, level, e.target.value)}
                        type="number"
                        inputProps={{ step: 0.01 }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}

              {/* Card Benefits */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Card Benefits</Typography>
              {cardBenefits.map((benefit, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      label="Benefit Title"
                      value={benefit.title}
                      onChange={(e) => handleCardBenefitChange(index, 'title', e.target.value)}
                    />
                    <IconButton onClick={() => removeCardBenefit(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField
                    fullWidth
                    label="Benefit Description"
                    value={benefit.description}
                    onChange={(e) => handleCardBenefitChange(index, 'description', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Box>
              ))}
              <Button onClick={addCardBenefit} sx={{ mb: 2 }}>
                Add Card Benefit
              </Button>

              {/* Eligibility */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Eligibility</Typography>
              {eligibilityTypes.map((type) => (
                <Box key={type} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, textTransform: 'capitalize' }}>
                    {type.replace('_', ' ')}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <TextField
                      label="Age"
                      value={eligibilityData[type].age}
                      onChange={(e) => handleEligibilityChange(type, 'age', e.target.value)}
                    />
                    <TextField
                      label="Income"
                      value={eligibilityData[type].income}
                      onChange={(e) => handleEligibilityChange(type, 'income', e.target.value)}
                    />
                  </Box>
                </Box>
              ))}

              {/* FAQs */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Frequently Asked Questions</Typography>
              {faqsData.map((faq, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      label="Question"
                      value={faq.question}
                      onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                    />
                    <IconButton onClick={() => removeFaq(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField
                    fullWidth
                    label="Answer"
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                    multiline
                    rows={3}
                  />
                </Box>
              ))}
              <Button onClick={addFaq} sx={{ mb: 2 }}>
                Add FAQ
              </Button>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || uploadingImage || !isModerator}
                >
                  {loading ? <CircularProgress size={24} /> : (editingProduct ? 'Update Product' : 'Create Product')}
                </Button>
                {editingProduct && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingProduct(null);
                      resetForm();
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Manage Categories Tab */}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Manage Product Categories
            </Typography>

            {categoryError && <Alert severity="error" sx={{ mb: 2 }}>{categoryError}</Alert>}
            {categorySuccess && <Alert severity="success" sx={{ mb: 2 }}>{categorySuccess}</Alert>}

            {/* Add Category Form */}
            <Box component="form" onSubmit={handleAddProductType} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Category Name"
                value={newProductType}
                onChange={(e) => setNewProductType(e.target.value)}
                margin="normal"
                required
              />

              <Button
                type="submit"
                variant="contained"
                disabled={categoryLoading || !isModerator}
                sx={{ mt: 2 }}
              >
                {categoryLoading ? <CircularProgress size={24} /> : 'Add Category'}
              </Button>
            </Box>

            {/* Categories List */}
            <Typography variant="h6" gutterBottom>
              Existing Categories
            </Typography>
            <List>
              {productTypes.map((type) => (
                <ListItem
                  key={type.id}
                  secondaryAction={
                    isAdmin && (
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteProductType(type.type)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={type.type}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Manage Products Tab */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Manage Products
            </Typography>

            {productsError && <Alert severity="error" sx={{ mb: 2 }}>{productsError}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {productsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {products.map((product) => {
                  // console.log('Rendering product:', product);
                  return (
                    <ListItem
                      key={product.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {isModerator && (
                            <IconButton
                              edge="end"
                              onClick={() => handleEditProduct(product)}
                              color="primary"
                              title="Edit Product"
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          {isAdmin && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteProduct(product.id)}
                              color="error"
                              title="Delete Product"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      }
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        {product.Image_url && (
                          <Box
                            component="img"
                            src={product.Image_url}
                            alt={product.card_name}
                            sx={{
                              width: 60,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <ListItemText
                          primary={product.card_name || 'No Name'}
                          secondary={
                            <Box component="span">
                              {`Category: ${product.type || 'No Type'} | Bank: ${product.bank_name || 'N/A'} | Created: ${new Date(product.created_at || '').toLocaleDateString()}`}
                            </Box>
                          }
                        />
                      </Box>
                    </ListItem>
                  );
                })}
                {products.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No products found." />
                  </ListItem>
                )}
              </List>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProductsTab; 
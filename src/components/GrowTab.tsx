'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Box, Tabs, Tab, Button, TextField, List, ListItem, ListItemText, IconButton, CircularProgress, MenuItem, Alert } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import apiClient from '../lib/api-client';
import { useAuth } from '../lib/auth-context';
import DeleteIcon from '@mui/icons-material/Delete';

interface GrowCategory {
  id: number;
  name: string;
  created_at: string;
}

const ManageCategory = () => {
  const { isAuthenticated, isModerator, isAdmin } = useAuth();
  const [categories, setCategories] = useState<GrowCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch categories
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getGrowCategories(1, 100);
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
      setLoading(false);
    };
    fetchCategories();
  }, [isAuthenticated]);

  // Add category
  const handleAdd = async () => {
    if (!newCategory.trim() || !isModerator) return;
    setAdding(true);
    try {
      const response = await apiClient.createGrowCategory({ name: newCategory.trim() });
      if (response.category) {
        setCategories((prev) => [response.category, ...prev]);
      }
      setNewCategory('');
    } catch (error) {
      console.error('Failed to add category:', error);
    }
    setAdding(false);
  };

  // Delete category
  const handleDelete = async (id: number) => {
    if (!isAdmin) return;
    setDeletingId(id);
    try {
      await apiClient.deleteGrowCategory(id.toString());
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
    setDeletingId(null);
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Please log in to access grow management
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="py-8" maxWidth={400} mx="auto">
      <Typography variant="h6" align="center" gutterBottom sx={{ color: 'text.primary' }}>Manage Category</Typography>
      {!isModerator && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Moderator access required to add categories
        </Alert>
      )}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="New Category"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          size="small"
          fullWidth
          disabled={!isModerator}
        />
        <Button variant="contained" color="success" onClick={handleAdd} disabled={adding || !newCategory.trim() || !isModerator}>
          {adding ? <CircularProgress size={20} /> : 'Add'}
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <List>
          {categories.map(cat => (
            <ListItem
              key={cat.id}
              secondaryAction={
                isAdmin ? (
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(cat.id)} disabled={deletingId === cat.id}>
                    {deletingId === cat.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                  </IconButton>
                ) : null
              }
            >
              <ListItemText primary={cat.name} sx={{ color: 'text.primary' }} />
            </ListItem>
          ))}
          {categories.length === 0 && <ListItem><ListItemText primary="No categories yet." /></ListItem>}
        </List>
      )}
    </Box>
  );
};

interface GrowPoster {
  id: number;
  title: string;
  image_url: string;
  category_id: number;
  created_at: string;
  category?: GrowCategory;
}

const AddPoster = () => {
  const { isAuthenticated, isModerator, isAdmin } = useAuth();
  const [categories, setCategories] = useState<GrowCategory[]>([]);
  const [posters, setPosters] = useState<GrowPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const [categoriesRes, postersRes] = await Promise.all([
        apiClient.getGrowCategories(1, 100),
        apiClient.getGrowPosters(1, 100)
      ]);
      setCategories(categoriesRes.categories || []);
      setPosters(postersRes.posters || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const handleAdd = async () => {
    if (!title.trim() || !selectedCategory || !isModerator) return;
    setAdding(true);
    try {
      const response = await apiClient.createGrowPoster({
        title: title.trim(),
        image_url: imageUrl.trim() || undefined,
        category_id: parseInt(selectedCategory)
      });
      if (response.poster) {
        setPosters((prev) => [response.poster, ...prev]);
      }
      setTitle('');
      setImageUrl('');
      setSelectedCategory('');
    } catch (error) {
      console.error('Failed to add poster:', error);
    }
    setAdding(false);
  };

  const handleDelete = async (poster: GrowPoster) => {
    if (!isAdmin) return;
    setDeletingId(poster.id);
    try {
      await apiClient.deleteGrowPoster(poster.id.toString());
      setPosters((prev) => prev.filter((p) => p.id !== poster.id));
    } catch (error) {
      console.error('Failed to delete poster:', error);
    }
    setDeletingId(null);
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Please log in to access grow management
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="py-8" maxWidth={600} mx="auto">
      <Typography variant="h6" align="center" gutterBottom sx={{ color: 'text.primary' }}>Add Poster</Typography>
      {!isModerator && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Moderator access required to add posters
        </Alert>
      )}
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        <TextField
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          disabled={!isModerator}
        />
        <TextField
          label="Image URL (Optional)"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          fullWidth
          disabled={!isModerator}
        />
        <TextField
          select
          label="Category"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          fullWidth
          disabled={!isModerator}
        >
          {categories.map(cat => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={adding || !title.trim() || !selectedCategory || !isModerator}
        >
          {adding ? <CircularProgress size={20} /> : 'Add Poster'}
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>Existing Posters</Typography>
          <List>
            {posters.map(poster => (
              <ListItem
                key={poster.id} sx={{ color: 'text.primary' }}
                secondaryAction={
                  isAdmin ? (
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(poster)} disabled={deletingId === poster.id}>
                      {deletingId === poster.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                    </IconButton>
                  ) : null
                }
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ color: 'text.primary', mb: 1 }}>
                    {poster.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {poster.category?.name || 'No category'}
                  </Typography>
                  {poster.image_url && (
                    <Box
                      component="img"
                      src={poster.image_url}
                      alt={`Poster: ${poster.title}`}
                      sx={{
                        width: '100%',
                        maxWidth: 200,
                        height: 'auto',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        mt: 1
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </Box>
              </ListItem>
            ))}
            {posters.length === 0 && <ListItem><ListItemText primary="No posters yet." /></ListItem>}
          </List>
        </Box>
      )}
    </Box>
  );
};

const GrowTab: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState(0);

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Please log in to access grow management
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h5" sx={{ color: 'text.primary' }}>Grow Management</Typography>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary" variant="fullWidth" sx={{ mb: 3 }}>
        <Tab label="Manage Categories" />
        <Tab label="Add Posters" />
      </Tabs>
      {tab === 0 && <ManageCategory />}
      {tab === 1 && <AddPoster />}
    </Box>
  );
};

export default GrowTab; 
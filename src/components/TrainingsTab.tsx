'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardContent, Typography, Box, TextField, Button, List, ListItem, ListItemText, IconButton, CircularProgress, Alert, MenuItem, Switch, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../lib/api-client';
import { useAuth } from '../lib/auth-context';

const TrainingsTab: React.FC = () => {
  const { isAuthenticated, isModerator, isAdmin } = useAuth();
  const [tab, setTab] = useState(0); // 0: Manage Categories, 1: Add Videos

  // Training categories state
  const [trainingCategories, setTrainingCategories] = useState<any[]>([]);
  const [newTrainingCategory, setNewTrainingCategory] = useState('');
  const [newTrainingBanner, setNewTrainingBanner] = useState('');
  const [trainingCategoryLoading, setTrainingCategoryLoading] = useState(false);
  const [trainingCategoryError, setTrainingCategoryError] = useState('');
  const [trainingCategorySuccess, setTrainingCategorySuccess] = useState('');

  // Fetch training categories
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchTrainingCategories = async () => {
      try {
        const response = await apiClient.getTrainingCategories(1, 100);
        setTrainingCategories(response.categories || []);
      } catch (error) {
        setTrainingCategoryError(error instanceof Error ? error.message : 'Failed to fetch categories');
      }
    };
    fetchTrainingCategories();
  }, [trainingCategorySuccess, isAuthenticated]);

  // Add new training category
  const handleAddTrainingCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isModerator) {
      setTrainingCategoryError('Moderator access required');
      return;
    }
    
    setTrainingCategoryLoading(true);
    setTrainingCategoryError('');
    setTrainingCategorySuccess('');
    
    if (!newTrainingCategory.trim()) {
      setTrainingCategoryError('Category name cannot be empty');
      setTrainingCategoryLoading(false);
      return;
    }
    
    try {
      await apiClient.createTrainingCategory({
        name: newTrainingCategory.trim(),
        banner_url: newTrainingBanner.trim() || undefined
      });
      setTrainingCategorySuccess('Training category added!');
      setNewTrainingCategory('');
      setNewTrainingBanner('');
    } catch (error) {
      setTrainingCategoryError(error instanceof Error ? error.message : 'Failed to add category');
    }
    setTrainingCategoryLoading(false);
  };

  // Delete training category
  const handleDeleteTrainingCategory = async (id: string) => {
    if (!isAdmin) {
      setTrainingCategoryError('Admin access required');
      return;
    }
    
    setTrainingCategoryLoading(true);
    setTrainingCategoryError('');
    setTrainingCategorySuccess('');
    
    try {
      await apiClient.deleteTrainingCategory(id);
      setTrainingCategorySuccess('Training category deleted!');
    } catch (error) {
      setTrainingCategoryError(error instanceof Error ? error.message : 'Failed to delete category');
    }
    setTrainingCategoryLoading(false);
  };

  // Training videos state
  const [selectedTrainingCategory, setSelectedTrainingCategory] = useState('');
  const [trainingVideos, setTrainingVideos] = useState<any[]>([]);
  const [newVideo, setNewVideo] = useState({
    title: '',
    youtube_url: '',
    thumbnail_url: '',
    is_featured: false,
    sort_order: 0,
  });
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [videoSuccess, setVideoSuccess] = useState('');

  // Fetch training videos for selected category
  useEffect(() => {
    if (!selectedTrainingCategory || !isAuthenticated) return;
    const fetchTrainingVideos = async () => {
      try {
        const response = await apiClient.getTrainingVideosByCategory(selectedTrainingCategory, 1, 100);
        setTrainingVideos(response.videos || []);
      } catch (error) {
        setVideoError(error instanceof Error ? error.message : 'Failed to fetch videos');
      }
    };
    fetchTrainingVideos();
  }, [selectedTrainingCategory, videoSuccess, isAuthenticated]);

  // Add new training video
  const handleAddTrainingVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isModerator) {
      setVideoError('Moderator access required');
      return;
    }
    
    setVideoLoading(true);
    setVideoError('');
    setVideoSuccess('');
    
    if (!selectedTrainingCategory) {
      setVideoError('Select a category');
      setVideoLoading(false);
      return;
    }
    if (!newVideo.title.trim() || !newVideo.youtube_url.trim()) {
      setVideoError('Title and YouTube URL are required');
      setVideoLoading(false);
      return;
    }
    
    try {
      await apiClient.createTrainingVideo({
        title: newVideo.title.trim(),
        youtube_url: newVideo.youtube_url.trim(),
        thumbnail_url: newVideo.thumbnail_url.trim() || undefined,
        category_id: selectedTrainingCategory,
        is_featured: newVideo.is_featured,
        sort_order: newVideo.sort_order
      });
      setVideoSuccess('Training video added!');
      setNewVideo({
        title: '',
        youtube_url: '',
        thumbnail_url: '',
        is_featured: false,
        sort_order: 0,
      });
    } catch (error) {
      setVideoError(error instanceof Error ? error.message : 'Failed to add video');
    }
    setVideoLoading(false);
  };

  // Delete training video
  const handleDeleteTrainingVideo = async (id: string) => {
    if (!isAdmin) {
      setVideoError('Admin access required');
      return;
    }
    
    setVideoLoading(true);
    setVideoError('');
    setVideoSuccess('');
    
    try {
      await apiClient.deleteTrainingVideo(id);
      setVideoSuccess('Training video deleted!');
    } catch (error) {
      setVideoError(error instanceof Error ? error.message : 'Failed to delete video');
    }
    setVideoLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Please log in to access training management
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary" variant="fullWidth" sx={{ mb: 3 }}>
        <Tab label="Manage Categories" />
        <Tab label="Add Videos" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>Manage Training Categories</Typography>
          {!isModerator && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Moderator access required to add categories
            </Alert>
          )}
          <Box component="form" onSubmit={handleAddTrainingCategory} sx={{ mb: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Category Name"
                value={newTrainingCategory}
                onChange={(e) => setNewTrainingCategory(e.target.value)}
                fullWidth
                required
                disabled={!isModerator}
              />
              <TextField
                label="Banner URL"
                value={newTrainingBanner}
                onChange={(e) => setNewTrainingBanner(e.target.value)}
                fullWidth
                disabled={!isModerator}
              />
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={trainingCategoryLoading || !newTrainingCategory.trim() || !isModerator}
                sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
              >
                {trainingCategoryLoading ? <CircularProgress size={20} /> : 'Add Category'}
              </Button>
            </Box>
          </Box>

          {trainingCategoryError && <Alert severity="error" sx={{ mb: 2 }}>{trainingCategoryError}</Alert>}
          {trainingCategorySuccess && <Alert severity="success" sx={{ mb: 2 }}>{trainingCategorySuccess}</Alert>}

          <List>
            {trainingCategories.map((category) => (
              <ListItem
                key={category.id}
                secondaryAction={
                  isAdmin ? (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteTrainingCategory(category.id)}
                      disabled={trainingCategoryLoading}
                    >
                      {trainingCategoryLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
                    </IconButton>
                  ) : null
                }
              >
                <ListItemText
                  primary={category.name} sx={{ color: 'text.primary' }}
                  secondary={
                    category.banner_url ? (
                      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                        Banner Preview:
                      </Typography>
                    ) : (
                      'No banner'
                    )
                  }
                />
                {category.banner_url && (
                  <Box sx={{ mt: 1, ml: 2 }}>
                    <Box
                      component="img"
                      src={category.banner_url}
                      alt={`Banner for ${category.name}`}
                      sx={{
                        width: '100%',
                        maxWidth: 200,
                        height: 'auto',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </Box>
                )}
              </ListItem>
            ))}
            {trainingCategories.length === 0 && (
              <ListItem>
                <ListItemText primary="No training categories yet." />
              </ListItem>
            )}
          </List>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>Add Training Videos</Typography>
          {!isModerator && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Moderator access required to add videos
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <TextField
              select
              fullWidth
              label="Select Category"
              value={selectedTrainingCategory}
              onChange={(e) => setSelectedTrainingCategory(e.target.value)}
              sx={{ mb: 2 }}
            >
              {trainingCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>

            {selectedTrainingCategory && (
              <Box component="form" onSubmit={handleAddTrainingVideo}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Video Title"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                    fullWidth
                    required
                    disabled={!isModerator}
                  />
                  <TextField
                    label="YouTube URL"
                    value={newVideo.youtube_url}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, youtube_url: e.target.value }))}
                    fullWidth
                    required
                    disabled={!isModerator}
                  />
                  <TextField
                    label="Thumbnail URL"
                    value={newVideo.thumbnail_url}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                    fullWidth
                    disabled={!isModerator}
                  />
                  <TextField
                    label="Sort Order"
                    type="number"
                    value={newVideo.sort_order}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    fullWidth
                    disabled={!isModerator}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newVideo.is_featured}
                        onChange={(e) => setNewVideo(prev => ({ ...prev, is_featured: e.target.checked }))}
                        disabled={!isModerator}
                      />
                    }
                    label="Featured Video"
                    sx={{ gridColumn: { xs: '1', md: '1 / -1' }, color: 'text.primary' }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={videoLoading || !newVideo.title.trim() || !newVideo.youtube_url.trim() || !isModerator}
                    sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
                  >
                    {videoLoading ? <CircularProgress size={20} /> : 'Add Video'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          {videoError && <Alert severity="error" sx={{ mb: 2 }}>{videoError}</Alert>}
          {videoSuccess && <Alert severity="success" sx={{ mb: 2 }}>{videoSuccess}</Alert>}

          {selectedTrainingCategory && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>Videos in Selected Category</Typography>
              {videoLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
                  {trainingVideos.map((video) => (
                    <Card key={video.id}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>{video.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          YouTube URL: {video.youtube_url}
                        </Typography>
                        {video.thumbnail_url && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              Thumbnail:
                            </Typography>
                            <Box
                              component="img"
                              src={video.thumbnail_url}
                              alt={`Thumbnail for ${video.title}`}
                              sx={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </Box>
                        )}
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Sort Order: {video.sort_order} | Featured: {video.is_featured ? 'Yes' : 'No'}
                        </Typography>
                        {isAdmin && (
                          <Box sx={{ mt: 2 }}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTrainingVideo(video.id)}
                              disabled={videoLoading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {trainingVideos.length === 0 && (
                    <Typography variant="body1" textAlign="center" sx={{ color: 'text.secondary' }}>
                      No videos in this category yet.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TrainingsTab; 
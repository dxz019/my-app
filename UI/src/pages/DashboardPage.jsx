import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { useStoryStore } from '../stores/storyStore'

export default function Dashboard({ token, showToast }) {
  const navigate = useNavigate()
  const { stories, fetchMyStories, loading, deleteStory } = useStoryStore()

  useEffect(() => {
    if (token) {
      fetchMyStories()
    }
  }, [token, fetchMyStories])

  const handleCreateNew = () => {
    navigate('/editor/new')
  }

  const handleEdit = (storyId) => {
    navigate(`/editor/${storyId}`)
  }

  const handleWatch = (storyId) => {
    navigate(`/watch/${storyId}`)
  }

  const handleDelete = async (storyId) => {
    await deleteStory(storyId)
    showToast('Story deleted', 'info')
  }

  if (!token) {
    return (
      <div className="flex flex-column align-items-center justify-content-center py-6">
        <h2 className="mb-3">Please log in to access your dashboard</h2>
        <Button label="Go to Login" icon="pi pi-sign-in" onClick={() => navigate('/login')} />
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">My Stories</h1>
        <Button label="Create New Story" icon="pi pi-plus" onClick={handleCreateNew} />
      </div>

      {loading ? (
        <div className="flex justify-content-center py-6">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-6">
          <i className="pi pi-book" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
          <h3 className="mt-3">No stories yet</h3>
          <p className="text-secondary">Create your first interactive story</p>
        </div>
      ) : (
        <div className="grid">
          {stories.map(story => (
            <div key={story._id} className="col-12 md:col-6 lg:col-4">
              <Card className="h-full">
                <div className="flex flex-column h-full">
                  <h3 className="mt-0">{story.title}</h3>
                  <p className="text-secondary flex-grow-1">{story.description || 'No description'}</p>
                  <div className="flex gap-2 mt-3">
                    <Button icon="pi pi-play" label="Watch" onClick={() => handleWatch(story._id)} className="p-button-success" />
                    <Button icon="pi pi-pencil" label="Edit" onClick={() => handleEdit(story._id)} />
                    <Button icon="pi pi-trash" onClick={() => handleDelete(story._id)} className="p-button-danger p-button-text" />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
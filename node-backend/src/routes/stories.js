import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import db from '../database.js'

const router = express.Router()

// Get all stories for current user
router.get('/', authenticateToken, (req, res) => {
  const stories = db.prepare('SELECT * FROM stories WHERE author_id = ? ORDER BY created_at DESC')
    .all(req.user.id)
  res.json(stories)
})

// Get public stories
router.get('/public', (req, res) => {
  const stories = db.prepare('SELECT s.*, u.username as author_name FROM stories s JOIN users u ON s.author_id = u.id WHERE s.is_public = 1 ORDER BY s.created_at DESC')
    .all()
  res.json(stories)
})

// Get single story
router.get('/:id', (req, res) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id)
  if (!story) return res.status(404).json({ detail: 'Story not found' })
  
  const parsed = {
    _id: story.id,
    title: story.title,
    description: story.description,
    author_id: story.author_id,
    is_public: story.is_public,
    thumbnail_url: story.thumbnail_url,
    ...JSON.parse(story.config || '{"nodes":[],"edges":[],"startNodeId":null}')
  }
  res.json(parsed)
})

// Create story
router.post('/', authenticateToken, (req, res) => {
  const { title } = req.body
  const id = db.prepare('INSERT INTO stories (title, author_id, config) VALUES (?, ?, ?)')
    .run(title || 'Untitled Story', req.user.id, JSON.stringify({ nodes: [], edges: [], startNodeId: null }))
  
  const story = {
    _id: id.lastInsertRowid,
    title: title || 'Untitled Story',
    nodes: [],
    edges: [],
    startNodeId: null
  }
  res.status(201).json(story)
})

// Update story graph
router.put('/:id', authenticateToken, (req, res) => {
  const { nodes, edges, startNodeId } = req.body
  const story = db.prepare('SELECT * FROM stories WHERE id = ? AND author_id = ?').get(req.params.id, req.user.id)
  if (!story) return res.status(404).json({ detail: 'Story not found' })

  const config = JSON.stringify({ nodes, edges, startNodeId })
  db.prepare('UPDATE stories SET config = ?, updated_at = datetime("now") WHERE id = ?')
    .run(config, req.params.id)

  const updated = {
    _id: story.id,
    title: story.title,
    nodes, edges, startNodeId
  }
  res.json(updated)
})

// Publish/unpublish story
router.post('/:id/publish', authenticateToken, (req, res) => {
  const { isPublic } = req.body
  const result = db.prepare('UPDATE stories SET is_public = ?, updated_at = datetime("now") WHERE id = ? AND author_id = ?')
    .run(isPublic ? 1 : 0, req.params.id, req.user.id)

  if (result.changes === 0) return res.status(404).json({ detail: 'Story not found' })
  res.json({ success: true, is_public: isPublic })
})

// Delete story
router.delete('/:id', authenticateToken, (req, res) => {
  const result = db.prepare('DELETE FROM stories WHERE id = ? AND author_id = ?').run(req.params.id, req.user.id)
  if (result.changes === 0) return res.status(404).json({ detail: 'Story not found' })
  res.json({ success: true })
})

export default router
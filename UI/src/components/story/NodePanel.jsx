import { useState, useEffect } from 'react'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { ColorPicker } from 'primereact/colorpicker'
import { Dropdown } from 'primereact/dropdown'

const animationTypes = [
  { label: 'Fade', value: 'fade' },
  { label: 'Slide', value: 'slide' },
  { label: 'Scale', value: 'scale' },
  { label: 'Particles', value: 'particles' }
]

export default function NodePanel({ node, onUpdate, onDelete }) {
  const [label, setLabel] = useState('')
  const [prompt, setPrompt] = useState('')
  const [animationType, setAnimationType] = useState('fade')
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  useEffect(() => {
    if (!node) return
    setLabel(node.data?.label || '')
    setPrompt(node.data?.prompt || '')
    setAnimationType(node.data?.animationType || 'fade')
    setThumbnailUrl(node.data?.thumbnailUrl || '')
  }, [node])

  if (!node) {
    return (
      <div className="node-panel">
        <div className="node-panel__placeholder">
          Select a node to edit
        </div>
      </div>
    )
  }

  const handleUpdate = () => {
    const updates = { label }
    if (node.type === 'video') {
      updates.thumbnailUrl = thumbnailUrl
    }
    if (node.type === 'choice') {
      updates.prompt = prompt
    }
    if (node.type === 'animation') {
      updates.animationType = animationType
    }
    onUpdate?.(node.id, updates)
  }

  return (
    <div className="node-panel">
      <h3 className="node-panel__title">Node Settings</h3>
      <div className="node-panel__type">{node.type} node</div>

      <div className="node-panel__field">
        <label>Label</label>
        <InputText value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>

      {node.type === 'video' && (
        <div className="node-panel__field">
          <label>Thumbnail URL</label>
          <InputText value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
        </div>
      )}

      {node.type === 'choice' && (
        <div className="node-panel__field">
          <label>Prompt</label>
          <InputTextarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} />
        </div>
      )}

      {node.type === 'animation' && (
        <div className="node-panel__field">
          <label>Animation Type</label>
          <Dropdown value={animationType} options={animationTypes} onChange={(e) => setAnimationType(e.value)} />
        </div>
      )}

      <div className="node-panel__actions">
        <Button label="Update" icon="pi pi-check" onClick={handleUpdate} className="p-button-success" />
        <Button label="Delete" icon="pi pi-trash" onClick={() => onDelete?.(node.id)} className="p-button-danger" />
      </div>
    </div>
  )
}
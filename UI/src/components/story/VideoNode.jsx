import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

export default memo(function VideoNode({ data, selected }) {
  return (
    <div className={`node-video ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-video__thumb">
        {data.thumbnailUrl ? (
          <img src={data.thumbnailUrl} alt={data.label} />
        ) : (
          <div className="node-video__placeholder">
            <span className="pi pi-video" style={{ fontSize: '24px' }}></span>
          </div>
        )}
      </div>
      <div className="node-video__label">{data.label || 'Untitled'}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})
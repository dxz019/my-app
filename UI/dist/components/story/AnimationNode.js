import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
export default memo(function AnimationNode({ data, selected }) {
    return (<div className={`node-animation ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top}/>
      <div className="node-animation__icon">✦</div>
      <div className="node-animation__type">{data.animationType || 'fade'}</div>
      <Handle type="source" position={Position.Bottom}/>
    </div>);
});

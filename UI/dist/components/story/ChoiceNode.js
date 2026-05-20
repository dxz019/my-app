import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
export default memo(function ChoiceNode({ data, selected }) {
    const choices = data.choices || [];
    return (<div className={`node-choice ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top}/>
      <div className="node-choice__prompt">{data.prompt || 'Choose...'}</div>
      <div className="node-choice__options">
        {choices.map((c, i) => (<div key={c.id} className="node-choice__option">{c.text || `Option ${i + 1}`}</div>))}
      </div>
      <Handle type="source" position={Position.Bottom}/>
    </div>);
});

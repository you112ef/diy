import { useState, type PropsWithChildren } from 'react';

const ThoughtBox = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`
        bg-bolt-elements-background-depth-2
        shadow-md 
        rounded-lg 
        cursor-pointer 
        transition-all 
        duration-300
        ${isExpanded ? 'max-h-96' : 'max-h-13'}
        overflow-auto
        border border-bolt-elements-borderColor
      `}
    >
      {/* Removed rounded-lg and border from this inner header div */}
      <div className="p-4 flex items-center gap-4 text-bolt-elements-textSecondary font-medium leading-5 text-sm">
        <div className="i-ph:brain-thin text-2xl" />
        <div className="div">
          <span> {title}</span>{' '}
          {!isExpanded && <span className="text-bolt-elements-textTertiary"> - Click to expand</span>}
        </div>
      </div>
      <div
        className={`
        transition-opacity 
        duration-300
        p-4
        ${isExpanded ? 'opacity-100' : 'opacity-0'}
        ${isExpanded ? '' : 'hidden'} {/* Effectively display:none when not expanded */}
      `}
      >
        {children}
      </div>
    </div>
  );
};

export default ThoughtBox;
